<?php

/** Absolute path to the WordPress directory. */
if ( !defined( "ABSPATH" ) )
    define( "ABSPATH", dirname(__FILE__) . "/wordpress/" );

$config = "config.php";

// look in root directory
if ( file_exists( ABSPATH . "../$config" ) )
    require_once( ABSPATH . "../$config" );
// or the directory above it
elseif ( file_exists( ABSPATH . "../../$config" ) )
    require_once( ABSPATH . "../../$config" );
else
    die( "NO CONFIG" );

if ( ! defined( "WP_DEBUG" ) )
    define( "WP_DEBUG", false );

require_once( ABSPATH . "wp-settings.php" );
