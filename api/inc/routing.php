<?php

	// Include AltoRouter
	include('inc/AltoRouter.php');

	// Setup Router
	$router = new AltoRouter();
	$router->setBasePath('');
	
	// Main router
	$router->map('GET', '/', 'home.php', 'home');
	// Notify function
	$router->map('GET', '/notify/[*:id]', 'page/notify.php', 'notify');
	
	// Check for a match
	$match = $router->match();
	if($match) {
		require $match['target'];
	} else 
	{
		header("HTTP/1.0 404 Not Found");
		require '404.html';
	}
	
?>