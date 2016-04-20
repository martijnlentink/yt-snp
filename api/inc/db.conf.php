<?php

	$host	= "localhost";
	$user	= "wolffd_cfynifu";
	$pass	= "0qVjmL0Vz8";
	$dbms	= "wolffd_cfynif";

	$dbCon = mysqli_connect($host, $user, $pass, $dbms);
	
	// Check for errors
	if(mysqli_connect_errno()){
		echo mysqli_connect_error();
	}

	
?>