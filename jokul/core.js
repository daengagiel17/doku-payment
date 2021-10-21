const crypto = require('crypto');

class Jokul{

  //generate digest
  digest(body){
    let jsonStringHash256 = crypto.createHash('sha256').update(body,"utf-8").digest();

    let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
    return bufferFromJsonStringHash256.toString('base64');
    // return body;
  }

  //generate signature
  signature(clientId, secretKey, requestId, requestTime, requestTarget, digest){
    let componentSignature = "Client-Id:" + clientId;
    componentSignature += "\n";
    componentSignature += "Request-Id:" + requestId;
    componentSignature += "\n";
    componentSignature += "Request-Timestamp:" + requestTime;
    componentSignature += "\n";
    componentSignature += "Request-Target:" + requestTarget;

    // If body not send when access API with HTTP method GET/DELETE
    if (digest) {
        componentSignature += "\n";
        componentSignature += "Digest:" + digest;
    }

    let hmac256Value = crypto.createHmac('sha256', secretKey)
                   .update(componentSignature.toString())
                   .digest();

    let bufferFromHmac256Value = Buffer.from(hmac256Value);
    let signature = bufferFromHmac256Value.toString('base64');

    // Prepend encoded result with algorithm info HMACSHA256=
    return "HMACSHA256="+signature
  }

  randomData(){
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = 10;
    for ( let i = 0; i < charactersLength; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }

  timeStamp(){
    let date = new Date().toISOString();
    return date.substring(0, 19)+'Z';
  }
}

module.exports = Jokul
