package sensors

import (
	"fmt"
	"errors"
	"casa-calida.com/casa-calida-razberry/sensors/casacalida"
	"casa-calida.com/casa-calida-razberry/sensors/zwave"
)

type Sensor struct {
	ip, protocol string
}

var SupportedProtocols = map[string]interface{}{
	"casa-calida": casacalida.GetSensorData,
	"zwave":       zwave.GetSensorData,
}

func GetSensor(ip string, protocol string) (Sensor) {
	return Sensor{ip, protocol}
}

func (s Sensor) GetSensorData() ([]byte, error) {
	var getSensorData, ok = SupportedProtocols[s.protocol]
	if (!ok) {
		return nil, errors.New(fmt.Sprintf("Unknown protocol %v", s.protocol))
	}
	return getSensorData.(func(string) ([]byte, error))(s.ip)
}
