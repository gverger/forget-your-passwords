
function setCheckPassword($scope) {
  var data = $scope.mainPassword[$scope.selectedProfile];
  var check = generatepassword('md5',data,'',3,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','','').substr(0,3);
  $scope.checkPassword = check;
}

function preGeneratePassword(mainPassword, currentAccount) {
  var password = "";
  var count = 0;
  if (!currentAccount) {
    return password;
  }
  var data = currentAccount.name +currentAccount.user + currentAccount.counter;

  while (password.length < currentAccount.length) {
    var key = mainPassword;
    if (count > 0) {
      key += '\n' + count;
    }
    password += generatepassword(
      currentAccount.alg, key, data, currentAccount.length,
      charsets[currentAccount.charset], currentAccount.prefix, currentAccount.suffix
    );

    count++;
  }
  if (currentAccount.prefix)
    password = currentAccount.prefix + password;
  if (currentAccount.suffix)
    password = password.substring(0, currentAccount.length - currentAccount.suffix.length)
  + currentAccount.suffix;
  return password.substring(0, currentAccount.length);
};

function generatepassword(
  hashAlgorithm, key, data, passwordLength, charset, prefix, suffix
) {
  var usingHMAC = hashAlgorithm.indexOf("hmac") > -1;
  if (!usingHMAC)
    key += data;
  var password = "";
  switch (hashAlgorithm) {
    case "sha256":
      password = PasswordMaker_SHA256.any_sha256(key, charset);
    break;
    case "hmac-sha256":
      password = PasswordMaker_SHA256.any_hmac_sha256(key, data, charset, true);
    break;
    case "hmac-sha256_fix":
      password = PasswordMaker_SHA256.any_hmac_sha256(key, data, charset, false);
    break;
    case "sha1":
      password = PasswordMaker_SHA1.any_sha1(key, charset);
    break;
    case "hmac-sha1":
      password = PasswordMaker_SHA1.any_hmac_sha1(key, data, charset);
    break;
    case "md4":
      password = PasswordMaker_MD4.any_md4(key, charset);
    break;
    case "hmac-md4":
      password = PasswordMaker_MD4.any_hmac_md4(key, data, charset);
    break;
    case "md5":
      password = PasswordMaker_MD5.any_md5(key, charset);
    break;
    case "md5_v6":
      password = PasswordMaker_MD5_V6.hex_md5(key, charset);
    break;
    case "hmac-md5":
      password = PasswordMaker_MD5.any_hmac_md5(key, data, charset);
    break;
    case "hmac-md5_v6":
      password = PasswordMaker_MD5_V6.hex_hmac_md5(key, data, charset);
    break;
    case "rmd160":
      password = PasswordMaker_RIPEMD160.any_rmd160(key, charset);
    break;
    case "hmac-rmd160":
      password = PasswordMaker_RIPEMD160.any_hmac_rmd160(key, data, charset);
    break;
  }
  return password;
}
