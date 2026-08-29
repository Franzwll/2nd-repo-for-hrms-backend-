<?php
try {
  $db = new mysqli('127.0.0.1', 'root', '', 'hotel_hr');
  if ($db->connect_error) { die('Connection failed: ' . $db->connect_error); }
  
  $result = $db->query('UPDATE job_posts SET picture = "job-post-pictures/sample.png" WHERE job_post_id = 18');
  
  $check = $db->query('SELECT job_post_id, title, picture FROM job_posts WHERE job_post_id = 18');
  if ($check && $row = $check->fetch_assoc()) {
    echo 'Updated job ' . $row['job_post_id'] . ': ' . $row['title'] . ' with picture: ' . $row['picture'] . PHP_EOL;
  }
  
  // Also update a couple more jobs for testing
  $db->query('UPDATE job_posts SET picture = "job-post-pictures/sample.png" WHERE job_post_id IN (1, 2)');
  echo 'Updated jobs 1 and 2 as well' . PHP_EOL;
  
  $db->close();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
?>
