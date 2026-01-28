{{-- This file is used for menu items by any Backpack v7 theme --}}
<li class="nav-item"><a class="nav-link" href="{{ backpack_url('dashboard') }}"><i class="la la-home nav-icon"></i> {{ trans('backpack::base.dashboard') }}</a></li>

<x-backpack::menu-item title="Events" icon="la la-calendar-alt" :link="backpack_url('event')" />
<x-backpack::menu-item title="Games" icon="la la-futbol" :link="backpack_url('game')" />
<x-backpack::menu-item title="Match sessions" icon="la la-stopwatch" :link="backpack_url('match-session')" />
<x-backpack::menu-item title="Players" icon="la la-users" :link="backpack_url('player')" />
<x-backpack::menu-item title="Teams" icon="la la-users-cog" :link="backpack_url('team')" />
<x-backpack::menu-item title="Tournaments" icon="la la-trophy" :link="backpack_url('tournament')" />
<x-backpack::menu-item title="Tournament pools" icon="la la-columns" :link="backpack_url('tournament-pool')" />
<x-backpack::menu-item title="Users" icon="la la-user-tie" :link="backpack_url('user')" />

<x-backpack::menu-item title="Clubs" icon="la la-question" :link="backpack_url('club')" />
<x-backpack::menu-item title="Contact people" icon="la la-question" :link="backpack_url('contact-person')" />
<x-backpack::menu-item title="Events" icon="la la-question" :link="backpack_url('event')" />
<x-backpack::menu-item title="Games" icon="la la-question" :link="backpack_url('game')" />
<x-backpack::menu-item title="Match sessions" icon="la la-question" :link="backpack_url('match-session')" />
<x-backpack::menu-item title="Players" icon="la la-question" :link="backpack_url('player')" />
<x-backpack::menu-item title="Teams" icon="la la-question" :link="backpack_url('team')" />
<x-backpack::menu-item title="Tournaments" icon="la la-question" :link="backpack_url('tournament')" />
<x-backpack::menu-item title="Tournament pools" icon="la la-question" :link="backpack_url('tournament-pool')" />
<x-backpack::menu-item title="Users" icon="la la-question" :link="backpack_url('user')" />