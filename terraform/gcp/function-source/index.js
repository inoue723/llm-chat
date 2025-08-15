const functions = require("@google-cloud/functions-framework");
const { GoogleAuth } = require("google-auth-library");

const TARGET_URL = process.env.TARGET_URL;
const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT;

functions.http("entry", async (req, res) => {
  try {
    const auth = new GoogleAuth();

    const claims = {
      iss: SERVICE_ACCOUNT,
      sub: SERVICE_ACCOUNT,
      aud: TARGET_URL,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const result = await auth.fetch(
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:signJwt`,
      {
        method: "POST",
        body: JSON.stringify({ payload: JSON.stringify(claims) }),
      },
    );

    const resp = await fetch(TARGET_URL, {
      headers: {
        Authorization: `Bearer ${result.data.signedJwt}`,
      },
      timeout: 5000, // 5秒でタイムアウト
    });

    const text = await resp.text();
    console.log(`Status: ${resp.status}, Body: ${text.slice(0, 100)}`);

    if (resp.ok) {
      res.status(200).send("ok");
    } else {
      res.status(500).send(`error: status ${resp.status}`);
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send(`error: ${err.message}`);
  }
});
