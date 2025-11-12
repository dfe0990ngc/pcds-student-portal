<?php
// core/Router.php
declare(strict_types=1);

class Router {
    private array $routes = [];
    private string $basePath = '';
    
    public function setBasePath(string $basePath): void {
        $this->basePath = rtrim($basePath, '/');
    }
    
    private function addRoute(string $method, string $path, array $handler, array $middleware = []): void {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware
        ];
    }
    
    public function get(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('GET', $path, $handler, $middleware);
    }
    
    public function post(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('POST', $path, $handler, $middleware);
    }
    
    public function put(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }
    
    public function delete(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }
    
    public function dispatch(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove base path from URI if it exists
        if ($this->basePath && strpos($uri, $this->basePath) === 0) {
            $uri = substr($uri, strlen($this->basePath));
            // Ensure URI starts with / after removing base path
            if (empty($uri) || $uri[0] !== '/') {
                $uri = '/' . $uri;
            }
        }
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->matchPath($route['path'], $uri)) {
                // Execute middleware
                foreach ($route['middleware'] as $middleware) {
                    $middlewareInstance = new $middleware();
                    $middlewareInstance->handle();
                }
                
                // Execute handler
                [$controller, $action] = $route['handler'];
                $controllerInstance = new $controller();
                $controllerInstance->$action();
                return;
            }
        }
        
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint not found'
        ]);
    }
    
    private function matchPath(string $routePath, string $uri): bool {
        return $routePath === $uri;
    }
}