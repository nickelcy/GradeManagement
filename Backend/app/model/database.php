<?php
// Need to be a root user when connecting to the database
class Database {
    private $connection;
    private $dbName;

    public function __construct($host = null, $user = null, $pass = null, $name = null, $port = null) {
        // Use provided parameters or fall back to environment variables
        $host = $host ?? $_ENV['DB_HOST'] ?? 'localhost';
        $user = $user ?? $_ENV['DB_USER'] ?? 'root';
        $pass = $pass ?? $_ENV['DB_PASS'] ?? 'root';
        $name = $name ?? $_ENV['DB_NAME'] ?? 'srms';
        $port = $port ?? $_ENV['DB_PORT'] ?? 3306;

        $this->dbName = $name;
        $this->connection = new mysqli($host, $user, $pass, null, $port);
        
        if ($this->connection->connect_error) {
            die("Connection failed: " . $this->connection->connect_error);
        }

        $this->connection->select_db($this->dbName);
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
    private function selectDatabase() {
        if (!$this->connection->select_db($this->dbName)) {
            throw new Exception("Database not found: " . $this->dbName);
        }
    }
    private function databaseExists() {
        $stmt = $this->connection->prepare(
            "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?"
        );
        $stmt->bind_param("s", $this->dbName);
        $stmt->execute();
        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();
        return $exists;
    }
    private function databaseHasTables() {
        $stmt = $this->connection->prepare(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?"
        );
        $stmt->bind_param("s", $this->dbName);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }
    public function initialize() {
        $this->resetDatabase();
    }
    public function initializeIfEmpty() {
        $initialized = false;
        if (!$this->databaseExists()) {
            $this->connection->query("CREATE DATABASE " . $this->dbName);
            $this->selectDatabase();
            $this->executeSqlFile(__DIR__ . '/sql/schema.sql');
            $this->executeSqlFile(__DIR__ . '/sql/seed.sql');
            return true;
        }

        if (!$this->databaseHasTables()) {
            $this->selectDatabase();
            $this->executeSqlFile(__DIR__ . '/sql/schema.sql');
            $this->executeSqlFile(__DIR__ . '/sql/seed.sql');
            $initialized = true;
        }
        return $initialized;
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
        $this->selectDatabase();
        $this->executeSqlFile(__DIR__ . '/sql/schema.sql');
    }
    public function seedDatabase() {
        $this->selectDatabase();
        $this->executeSqlFile(__DIR__ . '/sql/seed.sql');
    }
    public function initializeDatabase() {
        $this->resetDatabase();
        $this->updateDatabaseSchema();
        $this->seedDatabase();
    }  
}
