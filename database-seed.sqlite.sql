-- Demo account for first deploy when users table is empty.
-- Uses the same password hash as your local portal.db.

INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status) VALUES
  (
    (SELECT role_id FROM roles WHERE role_name = 'student'),
    'Артем',
    'user1@mail.ru',
    '+79223475849',
    'scrypt$e157604f646107c95c285697f4fcf157$37144956d12d255db142e4ab68c9f715c6e912d7d8764b833f03bae3508ea61ff05d35340459812d2f5be29c9121fbe747cc5f4710c38d2b7d93fbd1932f0553',
    'active'
  );
