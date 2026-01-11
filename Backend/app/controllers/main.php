<?php

class MainController {
    public function resetDatabase() {
        $db = new Database();
        $db->resetDatabase();
    }
    public function updateDatabaseSchema() {
        $db = new Database();
        $db->updateDatabaseSchema();
    }
    public function seedDatabase() {
        $db = new Database();
        $db->seedDatabase();
    }
    public function getDatabaseStatus() {
        $db = new Database();
        $dbStatus = $db->getConnection()->connect_error ? "disconnected" : "connected";
        return $dbStatus;
    }   
    public function getDatabaseType() {
        $db = new Database();
        $dbType = "MySQL";
        return $dbType;
    }   
    public function getDatabaseVersion() {
        $db = new Database();
        $dbVersion = $db->getConnection()->server_info;
        return $dbVersion;
    }
    public function getDatabaseHost() {
        $db = new Database();
        $dbHost = $db->getConnection()->host_info;
        return $dbHost;
    }   
}