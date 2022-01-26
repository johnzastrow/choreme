print('===============JAVASCRIPT===============');
print('Creating default accounts: ');

db.users.insert({ email: 'admin@choreme.net', firstName: "Admin", lastName: "Admin", password: '$2a$12$4bJ4yhxD9zWIWJKZzuw3uutWfWthNsgqW1ERmk1alphPGMmKDhff6', role: 'admin' });
db.users.insert({ email: 'parent@choreme.net', firstName: "Parent", lastName: "", password: '$2a$12$4bJ4yhxD9zWIWJKZzuw3uutWfWthNsgqW1ERmk1alphPGMmKDhff6', role: 'parent' });
db.users.insert({ email: 'children@choreme.net', firstName: "Children", lastName: "", password: '$2a$12$4bJ4yhxD9zWIWJKZzuw3uutWfWthNsgqW1ERmk1alphPGMmKDhff6', role: 'children' });

print('===============AFTER JS INSERT==========');
print('Count of rows in users collection: ' + db.users.count());

alltest = db.users.find();
while (alltest.hasNext()) {
    printjson(alltest.next());
}