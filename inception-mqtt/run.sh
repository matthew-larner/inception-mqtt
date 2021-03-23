#!/usr/bin/with-contenv bashio
set +u

CONFIG_PATH=/data/options.json

export BASE_URL=$(bashio::config 'baseUrl')
export PORT=$(bashio::config 'port')
export USERNAME=$(bashio::config 'username')
export PASSWORD=$(bashio::config 'password')
export POLLING_TIMEOUT=$(bashio::config 'polling_timeout')
export POLLING_DELAY=$(bashio::config 'polling_delay')

export MQTT_HOST=$(bashio::services mqtt "host")
export MQTT_PORT=$(bashio::services mqtt "port")
export MQTT_USER=$(bashio::services mqtt "username")
export MQTT_PASSWORD=$(bashio::services mqtt "password")

export MQTT_QOS=$(bashio::config 'qos')
export MQTT_RETAIN=$(bashio::config 'retain')
export MQTT_DISCOVERY=$(bashio::config 'discovery')
export MQTT_DISCOVERY_PREFIX=$(bashio::config 'discovery_prefix')
export MQTT_TOPIC_PREFIX=$(bashio::config 'topic_prefix')
export MQTT_AVAILABILITY_TOPIC=$(bashio::config 'availability_topic')
export MQTT_ALARM_CODE=$(bashio::config 'alarm_code')


bashio::log.info "Starting service."
npm run start