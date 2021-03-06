<?php

namespace App\Helpers;

use AltoRouter;

class Router {
    public $routes = [];
    public $path = false;

    public function importRoutes($router) {
        $this->routes = array_merge($this->routes, $router->routes);
    }
    
    public function allowCors()
    {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
        header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
    }

    public function render()
    {
        $router = new AltoRouter();
        
        if($this->path) {
            $router->setBasePath($this->path);
        }

        foreach ($this->routes as $route) {
            $router->map($route[0], $route[1], $route[2], $route[3]);
        }

        $match = $router->match();
        $isRouteExist = $match;
        if($isRouteExist) {
          $this->callController($match);
        } else {
          http_response_code(404);
        }
    }

    protected function callController($match)
    {
        $target = $match['target'];
        if (is_string($target)) {
          $controller = explode('::', $match['target'])[0];
          $action = explode('::', $match['target'])[1];

          $controller = "\\App\\Controllers\\$controller";
          $controller = new $controller();
          return $controller->$action($match['params']);
        }
        else if (is_callable($target)) {
          $target($match['params']);
        }
    }
    
}
