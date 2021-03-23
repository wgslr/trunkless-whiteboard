## Server configuration

The server is configured with [Apache HTTP Server](https://httpd.apache.org/).
This folder includes template configuration files for setting this up yourself.

The configuration expects valid SSL certificates.
You generate such with [Let's Encrypt](https://letsencrypt.org/) through, e.g., [certbot](https://certbot.eff.org/).

The configuration expects the system to be running on `http://127.0.0.1:12345/` locally.
This can be achieved by spinning up a Docker container with our pre-built image.

The configuration files also expect some additional configuration, such as path to log files.

You might also want to delete all `/cgi-bin/` related directives in the configuration.
These were used to enable automatic builds on our server.
They are left here for proof of work, but the deployment scripts are left out.
If you want to setup such yourself, look into `Suexec` for `httpd` and enable a user with docker access to rebuild and restart your docker container (or other server setup).
