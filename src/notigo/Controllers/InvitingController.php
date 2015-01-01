<?php
namespace notigo\Controllers;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Validator\Constraints as Assert;

class InvitingController
{

    public function addInvite(Request $request, Application $app)
    {

        $invites = $request->request->get('invites');
        $user_fbid = $app['facebook']->getUser();
        $lastGameId = $app['db']->fetchColumn('SELECT id FROM dars_htmlgame_games WHERE user_fbid = ? ORDER BY timestamp DESC', array($user_fbid), 0);
        if($invites && $user_fbid && $lastGameId) {
            foreach($invites as $invitee)
            {

                if(!$this->hasBeenInvited($app, $user_fbid, $invitee))
                {

                    // user has not been invited yet by this user... add him!
                    if($app['db']->insert('dars_htmlgame_invites', array('user_fbid' => $user_fbid,  'invited_fbid' => $invitee, 'game_id' => $lastGameId)))
                    {
                        $invitees .= $invitee." ";

                    }

                }

            }

            if($invitees)
            {

                return new Response(json_encode(array("status" => "OK",
                                                  "msg" => "Inserted '$invitees' in the database (invites) with fbid '$user_fbid' and game_id '$lastGameId'")),
                                                201);

            } else {

                return new Response(json_encode(array("status" => "ERROR",
                                                  "msg" => "All is good but this user has already been invited. | $invites")),
                                                201);

            }


        } else {

            return new Response(json_encode(array("status" => "ERROR",
                                                  "msg" => "Not data or you did not authenticated the app. | $invites")),
                                            201);

        }

    }


    private function hasBeenInvited(Application $app, $user_fbid, $invited_fbid)
    {

        $count = $app['db']->executeQuery('SELECT id FROM dars_htmlgame_invites WHERE user_fbid = ? AND invited_fbid = ?', array($user_fbid, $invited_fbid))->rowCount();
        if($count)
        {
            return true;
        } else {
            return false;
        }

    }


    public function fetchInvited(Application $app) {

        $user_fbid = $app['facebook']->getUser();
        $allInvited = $app['db']->fetchAll('SELECT invited_fbid FROM dars_htmlgame_invites WHERE user_fbid = ?', array($user_fbid));

        // Beutift the array and conver to json
        $jsonPrepared = array();
        foreach($allInvited as $invited) {
            array_push($jsonPrepared, $invited['invited_fbid']);
        }
        return new Response(json_encode(array("status" => "OK", "data" => $jsonPrepared)), 201);

    }

}
