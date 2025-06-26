{ pkgs }: {
  deps = [
    pkgs.nano
    pkgs.unzip
    pkgs.wget
    pkgs.nodejs_20
    pkgs.openjdk17
    pkgs.gradle
  ];
}