<?php

define( 'WP_AUTO_UPDATE_CORE', false );
define( 'WP_DEBUG', false );
// define( 'JETPACK_DEV_DEBUG', false );
// define( 'DISALLOW_FILE_MODS', true ); // Disables manual updating by user
define( 'DISALLOW_FILE_EDIT', true ); // Disabled file editing in the UI
define( 'WP_MEMORY_LIMIT', '256M' );
 
define( 'WP_DEFAULT_THEME', '[[THEME_SANITIZED]]' );
 
define( 'WP_HOME', '[[URL]]' );
define( 'WP_SITEURL', '[[URL]]/wordpress' );
define( 'WP_CONTENT_DIR', dirname( __FILE__ ) . '/content' );
define( 'WP_CONTENT_URL', WP_HOME . '/content' );
define( 'WP_PLUGIN_DIR', dirname(__FILE__) . '/content/plugins' );
define( 'WP_PLUGIN_URL', WP_HOME . '/content/plugins' );
define( 'WPMU_PLUGIN_URL', WP_HOME . '/content/mu-plugins' );
define( 'UPLOADS', '../media' );
 
// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', '[[DB_NAME]]' );
 
/** MySQL database username */
define( 'DB_USER', '[[DB_USER]]' );
 
/** MySQL database password */
define( 'DB_PASSWORD', '[[DB_PASSWORD]]' );
 
/** MySQL hostname */
define( 'DB_HOST', 'localhost');
 
/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );
 
/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );
 
/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
[[WORDPRESS_SALTS]]
 
/**#@-*/
 
/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = '[[TABLE_PREFIX]]';