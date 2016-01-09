<?php

	// Max number of notifications to process.
	$maxNotifications = 3;
	// Results array
	$result = array();

	// Get the notification ID
	$notifId = $match['params']['id'];
	
	// Only work when a valid notification ID has been passed
	if($notifId != "")
	{
		// Check wether notification ID is a number
		if(!is_numeric($notifId)) 
		{
			// Message object.
			$message = array(
				"nr" => "100.2",
				"message" => "Invalid ID",
				"success" => "false",
			);
				
			array_push($result, $message);
			
		} else {
		
			// Id -1 means first run.
			if($notifId != -1)
			{
		
				// Strip the notification ID
				$notifId = stripslashes($notifId);
				$notifId = mysqli_real_escape_string($dbCon, $notifId);
				
				// Get all notifications that are more recent then the given one
				$nQuery = mysqli_query($dbCon, "SELECT * FROM nif WHERE id > ".$notifId);
				
				// Only do something if there are more then 0 results
				if(mysqli_num_rows($nQuery) > 0)
				{
					/*
					// If there are more notifications then the max to process
					//	then we process just the last
					if($mysqli_num_rows($nQuery) > $maxNotifications)
					{
						
					}*/
					
					// Loop through the results
					while ($row = mysqli_fetch_assoc($nQuery)) 
					{
						$notif = array(
							"id" => $row["id"],
							"title" => $row["title"],
							"message" => $row["message"],
							"version" => $row["version"],
							"sent" => $row["sent"]
						);
						
						array_push($result, $notif);
					}
					
				}	else {
					
					// Message object.
					$message = array(
						"nr" => "100.3",
						"message" => "No newer notifications",
						"success" => "true",
					);
						
					array_push($result, $message);
				}
				
			}
			
		}
		
	} else {
		
		// Message object.
		$message = array(
			"nr" => "100.1",
			"message" => "Invalid request",
			"success" => "false",
		);
				
		array_push($result, $message);
		
	}
	
	echo json_encode($result);
?>