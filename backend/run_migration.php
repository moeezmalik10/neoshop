<?php
require_once 'db.php';

try {
    $pdo = getDB();
    
    // Read the migration file
    $migrationSQL = file_get_contents('migrations.sql');
    
    // Split by semicolon and execute each statement
    $statements = explode(';', $migrationSQL);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            try {
                $pdo->exec($statement);
                echo "Executed: " . substr($statement, 0, 50) . "...\n";
            } catch (Exception $e) {
                echo "Error executing statement: " . $e->getMessage() . "\n";
                echo "Statement: " . substr($statement, 0, 100) . "...\n";
            }
        }
    }
    
    echo "Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
