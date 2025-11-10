<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MakeServiceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Example: php artisan make:service UserService
     */
    protected $signature = 'make:service {name}';

    /**
     * The console command description.
     */
    protected $description = 'Create a new Service class in app/Services';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $path = app_path("Services/{$name}.php");

        // create Services directory if not exists
        if (!File::isDirectory(app_path('Services'))) {
            File::makeDirectory(app_path('Services'));
        }

        // check if file already exists
        if (File::exists($path)) {
            $this->error("Service already exists!");
            return;
        }

        // default class template
        $stub = <<<PHP
<?php

namespace App\Services;

class {$name}
{
    //
}

PHP;

        File::put($path, $stub);

        $this->info("Service created successfully: app/Services/{$name}.php");
    }
}
