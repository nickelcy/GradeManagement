<?php
// Need to be a root user when connecting to the database
class Database {
    private $connection;

    public function __construct($host = null, $user = null, $pass = null, $name = null, $port = null) {
        // Use provided parameters or fall back to environment variables
        $host = $host ?? $_ENV['DB_HOST'] ?? 'localhost';
        $user = $user ?? $_ENV['DB_USER'] ?? 'root';
        $pass = $pass ?? $_ENV['DB_PASS'] ?? 'root';
        $name = $name ?? $_ENV['DB_NAME'] ?? 'srms';
        $port = $port ?? $_ENV['DB_PORT'] ?? 3306;
        
        $this->connection = new mysqli($host, $user, $pass, $name, $port);
        
        if ($this->connection->connect_error) {
            die("Connection failed: " . $this->connection->connect_error);
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    private function executeSqlFile($filePath) {
        $sql = file_get_contents($filePath);
        if ($sql === false) {
            throw new Exception("Failed to read SQL file: " . $filePath);
        }
        
        if ($this->connection->multi_query($sql)) {
            do {
                if ($result = $this->connection->store_result()) {
                    $result->free();
                }
            } while ($this->connection->next_result());
            
            if ($this->connection->errno) {
                throw new Exception("SQL Error: " . $this->connection->error);
            }
        } else {
            throw new Exception("SQL Error: " . $this->connection->error);
        }
    }
    public function initialize() {
        $this->resetDatabase();
    }
    public function resetDatabase() {
        $this->connection->query("DROP DATABASE IF EXISTS " . $_ENV['DB_NAME']);
        $this->connection->query("CREATE DATABASE " . $_ENV['DB_NAME']);
        $this->connection->query("USE " . $_ENV['DB_NAME']);
        $this->executeSqlFile(__DIR__ . '/sql/reset.sql');
        $this->executeSqlFile(__DIR__ . '/sql/schema.sql');
        $this->executeSqlFile(__DIR__ . '/sql/seed.sql');
    }
    public function updateDatabaseSchema() {
        $this->executeSqlFile(__DIR__ . '/sql/schema.sql');
    }
    public function seedDatabase() {
        $this->executeSqlFile(__DIR__ . '/sql/seed.sql');
    }
    public function initializeDatabase() {
        $this->resetDatabase();
        $this->updateDatabaseSchema();
        $this->seedDatabase();
    }  
}