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

class LeaderBoardController
{

    public function getView(Request $request, Application $app)
    {

        $page = $request->get('page');

        $game = new GameController();
        $test = $this->fetchLeaderboard($request, $app, $page);
        $top10 = $this->fetchResults($request, $app, 10);

        return $app['twig']->render('leaderboard.twig', array('topLeaderboard' => $top10, 'pagination' => $test['pagination'], 'results' => $test['results'], 'startCount' => $test['startCount'], 'curPage' => $page));

    }


    public function fetchLeaderboard(Request $request, Application $app, $page) {

        $limit = 20;
        // count all games
        // $countAll = $app['db']->executeQuery("SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime
        //                                      FROM (SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
        //                                      FROM dars_htmlgame_games AS games
        //                                      LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        //                                      LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
        //                                      GROUP BY totalPoints
        //                                      ORDER BY finalTime ASC) as t
        //                                      GROUP BY t.user_fbid ORDER BY finalTime")->rowCount();

        $countAll = $app['db']->executeQuery("SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime
                                              FROM (SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
                                                   FROM dars_htmlgame_games AS games
                                                   LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
                                                   LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
                                                   GROUP BY totalPoints, users.user_fbid, games.id ORDER BY finalTime ASC) as t
                                              GROUP BY t.user_fbid
                                              ORDER BY finalTime")->rowCount();

        $lastPage = ceil($countAll/$limit);
        $firstPage = 3;

        $links[] = "«";
        if ($lastPage > 3) {
            // this specifies the range of pages we want to show in the middle
            $min = max($page - 2, 2);
            $max = min($page + 2, $lastPage-1);

            // we always show the first page
            $links[] = "1";

            // we're more than one space away from the beginning, so we need a separator
            if ($min > 2) {
                $links[] = "...";
            }

            // generate the middle numbers
            for ($i=$min; $i<$max+1; $i++) {
                if($i == $page) {
                    $links[] = "$i";
                } else {
                    $links[] = "$i";
                }
            }

            // we're more than one space away from the end, so we need a separator
            if ($max < $lastPage-1) {
                $links[] = "...";
            }
            // we always show the last page
            $links[] = "$lastPage";
        } else {
            // we must special-case three or less, because the above logic won't work
            if($lastPage == 0) {
                $links = array();
            } else if ($lastPage == 1) {
                $links = array("1");
            } else if ($lastPage == 2) {
                $links = array("1", "2");
            } else if ($lastPage == 3) {
                $links = array("1", "2", "3");
            }
            //$links = array("1", "2", "3");
        }
        if($lastPage == 0) {
            $links = array();
        } else if ($lastPage == 1) {
            $links = array("1");
        } else if ($lastPage == 2) {
            $links = array("1", "2");
        } else if ($lastPage == 3) {
            $links = array("1", "2", "3");
        } else {
            $links[] = "»";
        }

        if($page > 0){
            $startCount = $limit * $page - $limit +1;
            $start = $limit * $page - $limit;
            //echo $start . "," . $limit;
        }
        // dobi samo najboljše razultate posameznega userja
        // SELECT games.user_fbid, games.time, games.id, (1000 * count(invites.invited_fbid)) as bonus, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
        // FROM dars_htmlgame_games as games, dars_htmlgame_invites as invites
        // WHERE games.user_fbid = invites.user_fbid AND games.id = invites.game_id GROUP BY games.id

        // SELECT games.user_fbid, games.id, if(games.user_fbid = invites.user_fbid, "yes", "no") as connection
        // FROM dars_htmlgame_games as games, dars_htmlgame_invites as invites

        // SELECT games.user_fbid, games.id, games.time, if(games.user_fbid = invites.user_fbid, "yes", "no") as connection
        // FROM dars_htmlgame_games as games, dars_htmlgame_invites as invites
        // GROUP BY games.id

        // SELECT  games.id, games.user_fbid, games.time, (games.time - (1000 * count(invites.invited_fbid))) as FINALTIME
        // FROM    dars_htmlgame_games AS games
        // LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        // GROUP BY  games.id

        // SELECT games.id, games.user_fbid as user_fbid, users.name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as FINALTIME
        // FROM dars_htmlgame_games AS games
        // LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        // LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
        // GROUP BY totalPoints ASC

        // SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
        // FROM dars_htmlgame_games AS games
        // LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        // LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbi
        // GROUP BY totalPoints, users.user_fbid
        // ORDER BY finalTime ASC

        // LATEST
        // SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime
        //                                  FROM (
        // SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
        // FROM dars_htmlgame_games AS games
        // LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        // LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
        // GROUP BY totalPoints, users.user_fbid
        // ORDER BY finalTime ASC) as t
        // GROUP BY t.user_fbid ORDER BY finalTime ASC

        // BEFORE
        // SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime
        //  FROM (SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
        //  FROM dars_htmlgame_games AS games
        //  LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        //  LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
        //  GROUP BY totalPoints
        //  ORDER BY finalTime ASC) as t
        //  GROUP BY t.user_fbid ORDER BY finalTime ASC LIMIT $start,$limit

        $results = $app['db']->fetchAll("SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime
                                         FROM (SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
                                               FROM dars_htmlgame_games AS games
                                               LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
                                               LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
                                               GROUP BY totalPoints, users.user_fbid, games.id ORDER BY finalTime ASC) as t
                                         GROUP BY t.user_fbid
                                         ORDER BY finalTime ASC LIMIT $start,$limit");
        // Fix time in array

        foreach($results as $key => $row) {
            $results[$key]['finalTime'] = $this->formatSeconds($row['finalTime']/1000);
        }

        return array('results' => $results, 'results2' => 0, 'startCount' => $startCount, 'pagination' => $links);

    }


    private function formatSeconds($seconds)
    {
        $hours = 0;
        // $milliseconds = str_replace( "0.", '', $seconds - floor( $seconds ) );
        $milliseconds = str_replace("0.", '', sprintf('%0.2f', $seconds - floor($seconds)));

        if ( $seconds > 3600 )
        {
            $hours = floor( $seconds / 3600 );
        }
        $seconds = $seconds % 3600;


        return gmdate( 'i:s', $seconds ). ($milliseconds ? ":$milliseconds" : '');
    }


    public function fetchResults(Request $request, Application $app, $nr = 10)
    {

        // $results = $app['db']->fetchAll("SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime
        //                                  FROM (SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
        //                                  FROM dars_htmlgame_games AS games
        //                                  LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        //                                  LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
        //                                  GROUP BY totalPoints
        //                                  ORDER BY finalTime ASC) as t
        //                                  GROUP BY t.user_fbid ORDER BY finalTime ASC LIMIT 0, $nr");

        // Popravek:
        // SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime FROM (
        // SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime, count(invites.invited_fbid)
        // FROM dars_htmlgame_games AS games
        // LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
        // LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
        // GROUP BY totalPoints, users.user_fbid, games.id
        // ORDER BY finalTime ASC) as t
        // GROUP BY t.user_fbid ORDER BY finalTime ASC LIMIT
        $results = $app['db']->fetchAll("SELECT t.id, t.user_fbid, t.name, min(t.finalTime)as finalTime FROM (
                                        SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime, count(invites.invited_fbid)
                                        FROM dars_htmlgame_games AS games
                                        LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
                                        LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
                                        GROUP BY totalPoints, users.user_fbid, games.id
                                        ORDER BY finalTime ASC) as t
                                        GROUP BY t.user_fbid ORDER BY finalTime ASC LIMIT 0, $nr");

        foreach($results as $key => $row) {
            $results[$key]['finalTime'] = $this->formatSeconds($row['finalTime']/1000);
        }

        return $results;

    }


    public function fetchRank(Request $request, Application $app)
    {

        $user_fbid = $app['facebook']->getUser();

        $playerRank = $app['db']->fetchAssoc("SELECT *
                                              FROM(
                                                SELECT *, IF (@score=ui.finalTime, @rank:=@rank, @rank:=@rank+1) rank, @score:=ui.finalTime score
                                                    FROM(
                                                        SELECT t.id, t.user_fbid, t.name, min(t.finalTime)AS finalTime
                                                        FROM(
                                                            SELECT games.id, games.user_fbid as user_fbid, users.name as name, games.time as totalPoints, (games.time - (1000 * count(invites.invited_fbid))) as finalTime
                                                            FROM dars_htmlgame_games AS games
                                                            LEFT JOIN dars_htmlgame_invites AS invites ON invites.game_id = games.id
                                                            LEFT JOIN dars_htmlgame_users as users ON users.user_fbid = games.user_fbid
                                                            GROUP BY totalPoints, users.user_fbid, games.id ORDER BY finalTime ASC) t
                                                        GROUP BY t.user_fbid
                                                        ORDER BY finalTime) ui, (SELECT @score:=0, @rank:=0) r
                                                        ORDER BY finalTime ASC) b
                                              WHERE user_fbid = $user_fbid");

        return new Response(json_encode(array("status" => "OK",
                                              "data" => $playerRank['rank'])),
                                            201);
        // return new Response(json_encode(array("status" => "OK",
        //                                       "data" => 'n/a')),
        //                                     201);

    }


}
