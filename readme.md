## Enable Auth in MongoDB

  - do enable auth from within Docker container 1st run this command:

          ` docker ecex -it <container-number> sh `

  ` mongod --port 27017 --dbpath /data/db `//no need to run this from within Docker container as it is already running..use this locally

  ` mongo --port 27017 `

  ` use admin
    db.createUser(
      {
        user: "myUserAdmin",
        pwd: "abc123",
        roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
      }
    ) `

    * Disconnect the mongo shell.

    * Restart mongo shell

    ` mongod --auth --port 27017 --dbpath /data/db `

    ` mongo --port 27017 -u "myUserAdmin" -p "abc123" --authenticationDatabase "admin" `

    ` use admin
      db.auth("myUserAdmin", "abc123" ) `

    ` show dbs `

    ` use admin `

    `  show collections `

    `  db.system.users.find() `
