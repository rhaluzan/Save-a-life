<?php
date_default_timezone_set("Europe/Ljubljana");
header('P3P:CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"'); //fix for IE

require_once __DIR__.'/../vendor/autoload.php';
require_once __DIR__.'/../vendor/facebook/php-sdk/src/facebook.php';

use Silex\Application;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\Table;
use Silex\Provider;
use Silex\Provider\FormServiceProvider;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


$app = new Application();
$app['debug'] = true;


/* ===============
    Register stuff
================== */
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../view',
));
$app->register(new Silex\Provider\UrlGeneratorServiceProvider());
$app->register(new Silex\Provider\FormServiceProvider(), array());
$app->register(new Silex\Provider\ValidatorServiceProvider());
$app->register(new Silex\Provider\TranslationServiceProvider(), array(
    'translator.messages' => array(),
));
$app->register(new Tobiassjosten\Silex\Provider\FacebookServiceProvider(), array(
    'facebook.app_id'   => '',
    'facebook.secret'   => '',
    'facebook.cookies'   => true,
));
$app->register(new Silex\Provider\SessionServiceProvider());


/* =========
    Database
============ */
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options'    => array(
    'driver'        => 'pdo_mysql',
    'host'          => 'localhost',
    'dbname'        => '',
    'user'          => '',
    'password'      => '',
    'charset'       => 'utf8',
    'driverOptions' => array(1002 => 'SET NAMES utf8',),
  ),
));


/* ==========
    DB TABLES
============= */
$schema = $app['db']->getSchemaManager();

if (!$schema->tablesExist('dars_htmlgame_users')) {
    $users = new Table('dars_htmlgame_users');
    $users->addColumn('id', 'integer', array('unsigned' => true, 'autoincrement' => true));
    $users->addColumn('user_fbid', 'string', array('length' => 200, 'default' => null));
    $users->addColumn('name', 'string', array('length' => 80, 'default' => null));
    $users->addColumn('link', 'string', array('length' => 200, 'default' => null));
    // username field got removed! $users->addColumn('username', 'string', array('length' => 80, 'default' => null));
    $users->addColumn('gender', 'string', array('length' => 10, 'default' => null));
    $users->addColumn('email', 'string', array('length' => 120, 'default' => null));
    $users->addColumn('verified', 'string', array('length' => 20, 'default' => null));
    $users->addColumn('timestamp', 'datetime');        # Time when user played

    $users->setPrimaryKey(array('id'));
    $users->addUniqueIndex(array('fbid'));
    $users->addUniqueIndex(array('email'));

    $schema->createTable($users);
}

if (!$schema->tablesExist('dars_htmlgame_games')) {
    $games = new Table('dars_htmlgame_games');
    $games->addColumn('id', 'integer', array('unsigned' => true, 'autoincrement' => true));
    // $games->addColumn('game_id', 'string', array('length' => 200, 'default' => null));   # Game Id
    $games->addColumn('user_fbid', 'string', array('length' => 200, 'default' => null));    # User playing
    $games->addColumn('time', 'time', array('default' => null));                            # Points
    $games->addColumn('timestamp', 'datetime');    # Time when user played

    $games->setPrimaryKey(array('id'));

    $schema->createTable($games);
}

if (!$schema->tablesExist('dars_htmlgame_invites')) {
    $invites = new Table('dars_htmlgame_invites');
    $invites->addColumn('id', 'integer', array('unsigned' => true, 'autoincrement' => true));
    $invites->addColumn('game_id', 'string', array('length' => 200, 'default' => null));        # Game Id
    $invites->addColumn('user_fbid', 'string', array('length' => 200, 'default' => null));      # User that was sending invites
    $invites->addColumn('invited_fbid', 'string', array('length' => 200, 'default' => null));   # FBID of invited user
    $invites->addColumn('timestamp', 'datetime');      # Time when user played

    $invites->setPrimaryKey(array('id'));

    $schema->createTable($invites);
}


/* =========
    Routing
============ */
// Liked / NotLiked
$app->match('/', 'notigo\Controllers\IndexController::indexAction')->method('GET|POST')->bind('IndexController');

// Leaderboard
$app->match('/leaderboard/{page}', 'notigo\Controllers\LeaderBoardController::getView')->method('GET|POST')->bind('leaderboard')->value('page', '1');

// FB redirect after liking a page
$app->match('/redirect/', function () use ($app) {
    return $app['twig']->render('redirect.twig');
})->method('GET|POST');

$app->match('/notLiked', 'notigo\Controllers\IndexController::notLiked')->method('GET|POST')->bind('notLiked');

/* =========
    API
============ */
$app->match('/api/addGame', 'notigo\Controllers\GameController::addGame')->method('GET|POST')->bind('addGame');
$app->match('/api/addInvite', 'notigo\Controllers\InvitingController::addInvite')->method('GET|POST')->bind('addInvite');
$app->match('/api/fetchInvited', 'notigo\Controllers\InvitingController::fetchInvited')->method('GET|POST')->bind('fetchInvited');
$app->match('/api/fetchResults/{nr}', 'notigo\Controllers\LeaderBoardController::fetchResults')->method('GET')->bind('fetchResults');
$app->match('/api/fetchRank/', 'notigo\Controllers\LeaderBoardController::fetchRank')->method('GET')->bind('fetchRank');



$app->match('/api/lastAnswer', 'notigo\Controllers\GameController::checkLastAnswer')->method('GET|POST')->bind('lastAnswer');
$app->match('/api/getPoints', 'notigo\Controllers\GameController::getPlayerPointsAction')->method('GET|POST')->bind('getPoints');


/* =========
    Run app
============ */
$app->run();
