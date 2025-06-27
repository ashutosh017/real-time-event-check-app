## How to setup locally?

```

git clone https://github.com/ashutosh017/real-time-event-check-app.git

cd real-time-event-check-app

# Open two seprate terminals, and in your first terminal

cd backend

cp .env.example .env

npm i

npx prisma migrate dev --name=init

npm run build

node dist/seed.js

npm run dev

# Now in your second terminal

cd frontend

npm i

npm run start

```

<br>

### Test creds:

`email: ashu2@gmail.com` 
`password: asdf`



## Project Images:
<div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; flex-wrap: wrap;">

  <img src="./images/Screenshot from 2025-06-27 18-40-26.png" alt="Events Page" style="width: 32%;"/>
  <img src="./images/Screenshot from 2025-06-27 18-40-47.png" alt="Sign In Page" style="width: 32%;"/>
  <img src="./images/Screenshot from 2025-06-27 18-40-55.png" alt="Sign Up Page" style="width: 32%;"/>

</div>
