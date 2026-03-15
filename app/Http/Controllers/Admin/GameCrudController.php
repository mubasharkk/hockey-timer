<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentPool;
use App\Models\User;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class GameCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class GameCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    /**
     * Configure the CrudPanel object. Apply settings to all operations.
     *
     * @return void
     */
    public function setup()
    {
        CRUD::setModel(\App\Models\Game::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/game');
        CRUD::setEntityNameStrings('game', 'games');
    }

    /**
     * Define what happens when the List operation is loaded.
     *
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        CRUD::setFromDb(); // set columns from db columns.

        /**
         * Columns can be defined using the fluent syntax:
         * - CRUD::column('price')->type('number');
         */
    }

    /**
     * Define what happens when the Create operation is loaded.
     *
     * @see https://backpackforlaravel.com/docs/crud-operation-create
     * @return void
     */
    protected function setupCreateOperation()
    {
        CRUD::setValidation(StoreGameRequest::class);
        CRUD::setFromDb(); // set fields from db columns.

        /**
         * Fields can be defined using the fluent syntax:
         * - CRUD::field('price')->type('number');
         */
    }

    /**
     * Define what happens when the Update operation is loaded.
     *
     * @see https://backpackforlaravel.com/docs/crud-operation-update
     * @return void
     */
    protected function setupUpdateOperation()
    {

        CRUD::setValidation(UpdateGameRequest::class);

        CRUD::field('tournament_id')
            ->type('select')
            ->label('Tournament')
            ->entity('tournament')
            ->model(Tournament::class)
            ->attribute('title')
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('game_type')
            ->type('select_from_array')
            ->label('Game Type')
            ->options(Game::allowedTypes())
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('tournament_pool_id')
            ->type('select')
            ->label('Pool (optional)')
            ->entity('tournamentPool')
            ->model(TournamentPool::class)
            ->attribute('name')
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('user_id')
            ->type('select')
            ->label('Created By')
            ->entity('user')
            ->model(User::class)
            ->attribute('name')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('home_team_id')
            ->type('select')
            ->label('Home Team')
            ->entity('homeTeam')
            ->model(Team::class)
            ->attribute('name')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('away_team_id')
            ->type('select')
            ->label('Away Team')
            ->entity('awayTeam')
            ->model(Team::class)
            ->attribute('name')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('team_a_name')
            ->type('text')
            ->label('Home Team Name (override)')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('team_b_name')
            ->type('text')
            ->label('Away Team Name (override)')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('venue')
            ->type('text')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('code')
            ->type('text')
            ->label('Game Code')
            ->attributes(['readonly' => 'readonly'])
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('game_date')
            ->type('date')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('game_time')
            ->type('time')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('excerpt')
            ->type('text')
            ->hint('Short description shown on public ticker');

        CRUD::field('notes')
            ->type('textarea');

        CRUD::field([
            'name' => 'sessions',
            'type' => 'select_from_array',
            'label' => 'Number of Sessions',
            'options' => [1 => '1', 2 => '2 (Halves)', 4 => '4 (Quarters)', 6 => '6', 8 => '8'],
            'entity' => false,
            'wrapper' => ['class' => 'form-group col-md-4'],
        ]);

        CRUD::field('session_duration_minutes')
            ->type('number')
            ->label('Session Duration (min)')
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('timer_mode')
            ->type('select_from_array')
            ->options(['ASC' => 'Count Up (ASC)', 'DESC' => 'Count Down (DESC)'])
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('sport_type')
            ->type('select_from_array')
            ->options(config('game.sports'))
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('continue_timer_on_goal')
            ->type('checkbox')
            ->label('Continue timer on goal')
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('status')
            ->type('select_from_array')
            ->options([
                'scheduled' => 'Scheduled',
                'live' => 'Live',
                'paused' => 'Paused',
                'finished' => 'Finished',
            ])
            ->wrapper(['class' => 'form-group col-md-4']);

        CRUD::field('game_officials')
            ->type('textarea')
            ->label('Game Officials');

        CRUD::field('started_at')
            ->type('datetime')
            ->wrapper(['class' => 'form-group col-md-6']);

        CRUD::field('ended_at')
            ->type('datetime')
            ->wrapper(['class' => 'form-group col-md-6']);
    }
}
