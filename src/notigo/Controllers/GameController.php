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

class GameController
{

    public function addGame(Request $request, Application $app)
    {

        /*
        Fields:
        game_id - dropping this field and using normal ID instead
        user_fbid
        time
        */

        // retrive & decode json post data
        $time = $request->request->get('time');
        $fbid = $app['facebook']->getUser();

        if($time && $fbid) {


            if($app['db']->insert('dars_htmlgame_games', array('user_fbid' => $fbid,  'time' => $time)))
            {

                return new Response(json_encode(array("status" => "OK", "msg" => "Inserted '$time' in the database with fbid '$fbid'")), 201);

            } else {

                return new Response(json_encode(array("status" => "ERROR", "msg" => "Not inserted in the database.")), 201);

            }


        } else {

            return new Response(json_encode(array("status" => "ERROR", "msg" => "Not data or you did not authenticated the app. | $time - $fbid")), 201);

        }

    }

}
