<?php
/**
 * =============================
 * BaaSConfig.php – Das Gehirn
 * =============================
 * Verwaltet App-Konfiguration, DB-Verbindung und Schema-Cache.
 */
class BaaSConfig {
    private static ?BaaSConfig $instance = null;
    private ?PDO $db = null;
    private array $config = [];
    private array $schemaCache = [];

    /**
     * Der Konstruktor ist privat. Er parst die DB-URL aus der app-config.json
     * und stellt die PDO-Verbindung her.
     */
    private function __construct() {
        $configPath = __DIR__ . '/app-config.json';

        if (!file_exists($configPath)) {
            $this->sendError('app-config.json not found!', 500);
        }
        
        $this->config = json_decode(file_get_contents($configPath), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->sendError('Error in app-config.json: ' . json_last_error_msg(), 500);
        }

        $dbUrl = parse_url($this->config['database']);
        if (!$dbUrl) {
            $this->sendError('Invalid database URL in app-config.json', 500);
        }
        
        $host = $dbUrl['host'];
        $dbname = ltrim($dbUrl['path'], '/');
        $user = $dbUrl['user'];
        $pass = $dbUrl['pass'];
        
        try {
            $this->db = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
            // Explizit UTF-8 setzen
            $this->db->exec("SET NAMES utf8mb4");
        } catch (PDOException $e) {
            $this->sendError('Database connection failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Die einzige Methode, um eine Instanz der Klasse zu erhalten (Singleton-Pattern).
     */
    public static function getInstance(): BaaSConfig {
        if (self::$instance === null) {
            self::$instance = new BaaSConfig();
        }
        return self::$instance;
    }

    // --- ÖFFENTLICHE GETTER ---

    public function getDb(): PDO { 
        return $this->db; 
    }
    
    public function getConfig(): array { 
        return $this->config; 
    }
    
    public function getMapping(string $mappingName): ?string {
        return $this->config['form_mappings'][$mappingName] ?? null;
    }
    
    public function getSchema(string $tableName): array {
        if (!isset($this->schemaCache[$tableName])) {
            try {
                $stmt = $this->db->query("DESCRIBE `$tableName`");
                $columns = [];
                foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $columnName) {
                    $columns[$columnName] = true;
                }
                $this->schemaCache[$tableName] = $columns;
            } catch (PDOException $e) {
                $this->schemaCache[$tableName] = [];
            }
        }
        return $this->schemaCache[$tableName];
    }
    
    // --- HILFSFUNKTIONEN ---

    public function sendResponse(mixed $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    public function sendError(string $message, int $statusCode = 400): void {
        $this->sendResponse(['success' => false, 'message' => $message], $statusCode);
    }
}
?>