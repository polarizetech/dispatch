<?php

namespace Dispatch;

use Illuminate\Support\ServiceProvider;

class DispatchServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        $this->publishesMigrations([
            __DIR__.'/../database/migrations' => database_path('migrations'),
        ], 'dispatch.migrations');

        $this->publishes([
            __DIR__.'/../config/dispatch.php' => config_path('dispatch.php'),
        ], 'dispatch.config');
    }
}
