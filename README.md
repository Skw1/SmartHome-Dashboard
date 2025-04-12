ESP8266 + BME280 SmartHome Dashboard

ESP8266 Code
```markdown
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

#define SEALEVELPRESSURE_HPA (1013.25)

const char* ssid = "TOUR-WIFI-NAME";
const char* password = "YOUR-WIFI-PASSWORD";

ESP8266WebServer server(80);
Adafruit_BME280 bme;

WiFiUDP udp;
NTPClient timeClient(udp, "pool.ntp.org", 2*3600, 60000);

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    Serial.print(".");
    delay(500);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected to WiFi!");
    Serial.print("🔗 IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Failed to connect to WiFi. Restarting...");
    ESP.restart(); 
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  connectToWiFi();
  timeClient.begin();
  timeClient.update();

  if (!bme.begin(0x76)) {
    Serial.println("❌ Could not find a valid BME280 sensor at address 0x76. Check wiring!");
    while (1); 
  }
  Serial.println("✅ BME280 sensor initialized.");

  server.on("/data", HTTP_GET, [&]() {
    timeClient.update();
    String currentTime = timeClient.getFormattedTime();
    
    
    float pressure = bme.readPressure() / 100.0F; 
    float altitude = bme.readAltitude(SEALEVELPRESSURE_HPA); 
    
    server.sendHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST");

    StaticJsonDocument<256> doc;
    doc["temperature"] = bme.readTemperature();
    doc["humidity"] = bme.readHumidity();
    doc["pressure"] = pressure;
    doc["altitude"] = altitude; 
    doc["time"] = currentTime; 
    doc["sensor"] = "BMP280";
    doc["connection"] = "MQTT";
    doc["mode"] = "NORMAL";

    String json;
    serializeJson(doc, json);
    server.send(200, "application/json", json);
  });

  server.begin();
  Serial.println("🌐 Web server started. Access /data to get sensor info.");
}

void loop() {
  server.handleClient();

  timeClient.update();  

 
  float temp = bme.readTemperature();
  float hum = bme.readHumidity();
  float pres = bme.readPressure() / 100.0F;

  if (isnan(temp)) {
    Serial.println("Failed to read temperature!");
  } else {
    Serial.print("Temperature: ");
    Serial.println(temp);
  }

  if (isnan(hum)) {
    Serial.println("Failed to read humidity!");
  } else {
    Serial.print("Humidity: ");
    Serial.println(hum);
  }

  if (isnan(pres)) {
    Serial.println("Failed to read pressure!");
  } else {
    Serial.print("Pressure: ");
    Serial.println(pres);
  }

  delay(5000); 
}
