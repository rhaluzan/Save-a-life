<?php
namespace notigo\Controllers;

use Silex\Application;
use notigo\Controllers\PlayerController;
use notigo\Controllers\LeaderBoardController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Validator\Constraints as Assert;

define("setDate", "now");

class IndexController
{

    public function indexAction(Request $request, Application $app)
    {

        $signedRequest = $app['facebook']->getSignedRequest();

        $leaderboard = new LeaderboardController();
        $top10 = $leaderboard->fetchResults($request, $app, 10);

        if($signed_request = $app['facebook']->parsePageSignedRequest())
        {

            if($signed_request->page->liked)
            {

                if($app['facebook']->getUser())
                {

                    try {

                        // check users permissions and save true if user has email permissions
                        $user_profile = $app['facebook']->api('/me/permissions');
                        foreach($user_profile['data'] as $key => $value) {

                            if($value['permission'] === 'email' && $value['status'] === 'granted') {
                                $emailPermissions = true;
                            }

                        }

                        // check if user has approved email permissions
                        if($emailPermissions) {

                            $player = new PlayerController();
                            if(!$player->checkIfExists($request, $app, $app['facebook']->getUser()))
                            {

                                $player->add($request, $app);

                            }

                            return $app['twig']->render('liked.twig', array('topLeaderboard' => $top10));

                        } else {
                            // user hasn't approved email permisions  # TODO
                            return $app['twig']->render('liked.twig', array('topLeaderboard' => $top10));
                        }

                      } catch (FacebookApiException $e) {
                        // Here : API call failed, you don't have a valid access token
                        // you have to send him to $facebook->getLoginUrl()
                        $user = null;
                    }


                } else {  // did not get user

                    return $app['twig']->render('liked.twig', array('topLeaderboard' => $top10));

                }


            } else {

                return $app['twig']->render('notLiked.twig', array('topLeaderboard' => $top10));

            }


        }

        // echo "WHATT!?!?";
        return $app['twig']->render('liked.twig', array('topLeaderboard' => $top10));

    }


    public function notLiked(Request $request, Application $app)
    {

        $leaderboard = new LeaderboardController();
        $top10 = $leaderboard->fetchResults($request, $app, 10);
        return $app['twig']->render('notLiked.twig');

    }

}
