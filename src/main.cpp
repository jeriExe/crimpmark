#include <Arduino.h>
#include <HX711.h>
#include <ArduinoBLE.h>

#define DOUT_PIN  2
#define SCK_PIN   3

HX711 scale;

// UUIDs — must match the frontend
BLEService forceService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
BLEStringCharacteristic forceChar("beb5483e-36e1-4688-b7f5-ea07361b26a8", BLERead | BLENotify, 20);
BLEStringCharacteristic commandChar("6e400002-b5a3-f393-e0a9-e50e24dcca9e", BLEWrite, 4);

void doTare() {
  scale.tare();
  Serial.println("Tare complete.");
}

void setup() {
  Serial.begin(115200);
  scale.begin(DOUT_PIN, SCK_PIN);
  scale.set_scale(23620.f);
  doTare();

  if (BLE.begin()) {
    BLE.setLocalName("Crimpmark");
    BLE.setAdvertisedService(forceService);
    forceService.addCharacteristic(forceChar);
    forceService.addCharacteristic(commandChar);
    BLE.addService(forceService);
    BLE.advertise();
    Serial.println("BLE advertising as 'Crimpmark'");
  } else {
    Serial.println("BLE init failed — serial only");
  }

  Serial.println("Ready. Pull! (send 't' to tare, 'r' for raw)");
}

void loop() {
  BLE.poll();

  // Serial commands
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 't' || c == 'T') {
      doTare();
    } else if (c == 'r' || c == 'R') {
      long raw = scale.get_value(10);
      Serial.print("Raw: ");
      Serial.println(raw);
      Serial.println("New scale factor = raw / actual_kg");
    }
  }

  // BLE commands
  if (commandChar.written()) {
    String cmd = commandChar.value();
    if (cmd == "t" || cmd == "T") doTare();
  }

  if (scale.is_ready()) {
    float reading = scale.get_units(10);

    Serial.print("Pull: ");
    Serial.print(reading, 3);
    Serial.println(" kg");

    if (BLE.connected()) {
      forceChar.writeValue(String(reading, 3));
    }
  }

  delay(200);
}
