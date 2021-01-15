<?php
/* Create new file */
$fp = fopen('output.csv', 'w');

$output = [
  ["A", "B", "C"],
  ["a\"", "b", "c"],
  ["a\\\"", "b", "c"],
];

/* Save the data */
foreach ($output as $row) {
  fputcsv($fp, $row, ',', '"', '\\');
}

fclose($fp);

