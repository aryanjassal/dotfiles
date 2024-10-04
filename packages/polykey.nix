{ ... }:

{
  programs.polykey = {
    enable = true;
    passwordFilePath = "%h/.pkpass";
    recoveryCodeOutPath = "%h/.pkrecovery";
  };
}
