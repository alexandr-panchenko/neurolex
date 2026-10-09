CREATE TABLE external_usage (bucket TEXT PRIMARY KEY, calls INTEGER NOT NULL);
CREATE TABLE chat_requests (actor TEXT NOT NULL, id TEXT NOT NULL, hash TEXT NOT NULL, result TEXT, PRIMARY KEY(actor,id));
CREATE TABLE feedback (id TEXT PRIMARY KEY, actor TEXT NOT NULL, page TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL);
