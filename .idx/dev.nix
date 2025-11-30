{ pkgs, ... }: {
    channel = "stable-23.11";
      packages = [
          pkgs.nodejs_20
            ];
              idx = {
                  extensions = [];
                      previews = {
                            enable = true;
                                  previews = {
                                          web = {
                                                    # هذا هو أمر تشغيل مشروعك (Vite)
                                                              command = ["npm" "run" "preview"];
                                                                        manager = "web";
                                                                                };
                                                                                      };
                                                                                          };
                                                                                            };
                                                                                            
                                                                                            
}