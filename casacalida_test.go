package main

import "testing"
import "encoding/json"
import "casa-calida.com/casa-calida-razberry/sensors"

// ----- MOCKS BEGIN -------
type Sensor struct {
	ip, protocol string
}

type JSONData struct {
	temperature, humidity float64
}

func (s Sensor) GetSensorData() ([]byte, error) {
	data := JSONData{21, 64}
	return json.Marshal(data)
}
// ----- MOCKS END -------

func TestGetSensorData(t *testing.T) {
	sensor := sensors.Sensor(Sensor{"10.0.0.1", "casa-calida"})
  	prevData := [2]float64{0, 0}

  	error := getSensorData(sensor, &prevData)

  	if error != nil {
		t.Error("Expected no error")
  	}
  
}