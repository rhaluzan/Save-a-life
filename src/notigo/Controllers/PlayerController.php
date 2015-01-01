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

define("setDate", "now");

class PlayerController
{


    public function add(Request $request, Application $app)
    {

        $user_profile = $app['facebook']->api('/'.$app['facebook']->getUser());

        if($user_profile['email']) {
            $email = $user_profile['email'];
        } else {
            $email = '';
        }

        $app['db']->insert("dars_htmlgame_users", array(
                    "user_fbid"     => $user_profile['id'],
                    "name"          => $user_profile['name'],
                    "link"          => $user_profile['link'],
                    "gender"        => $user_profile['gender'],
                    "email"         => $email,
                    "verified"      => $user_profile['verified']
                ));

        return true;

    }

    public function checkIfExists(Request $request, Application $app, $player)
    {

        $user =  $app['db']->fetchAssoc('SELECT count(user_fbid) as count FROM dars_htmlgame_users WHERE user_fbid = ?', array($player));

        if($user && $user['count'] > 0)
        {
            return true;
        } else {
            return false;
        }

    }

}
