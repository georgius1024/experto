set dt=%date%_%time:~3,2%-%time:~6,2%
7z a -r "snapshots/fe-%dt%.7z" *.* -xr!.git -xr!node_modules
