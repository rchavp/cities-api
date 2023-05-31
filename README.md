# GAN Integrity Code Challenge

## TL;DR
Clone the repo to a local folder and from that folder in the terminal run:

```
npm i
npm run dev
```

This will start the api server.

Then go ahead and run separately the javascript code that executes all the tests from here: https://github.com/gandevops/backend-code-challenge

## Notes

1. I used nodejs v.18 for this test and found no issues though I know there might be some with node-fetch if an older version is used alongside newer packages like express. I didn't find any issue myself however while respecting the package-lock.json
2. I did the challenge using typescript because I had time to do so and to showcase my experience with it.
3. I implemented an in memory repo to hold the cities json file. I would not necessarily use this in real life, but for the puposes of this test it should suffice. For a real api I would use a persistent source like a DB to make queries more efficient and decoupled from the api code.
4. I didn't use a logger package but in real life I would. 
5. I separated the concerns into controllers, services and repositories. However, the nature of this test didn't call for a service layer so I didn't add a service.
6. Normally I only write comments while explaining business logic or anything that is not evident by the code itself, but here I added more to aid in the test review.


