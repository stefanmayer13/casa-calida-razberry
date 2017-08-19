package sensors

import (
	"fmt"
	"errors"
	"casa-calida.com/casa-calida-razberry/sensors/casacalida"
	"casa-calida.com/casa-calida-razberry/sensors/zwave"
)

var SupportedProtocols = map[string]interface{}{
	"casa-calida": casacalida.GetSensorData,
	"zwave":       zwave.GetSensorData,
}

func GetSensorData(ip string, protocol string) ([]byte, error) {
	var getSensorData, ok = SupportedProtocols[protocol]
	if (!ok) {
		return nil, errors.New(fmt.Sprintf("Unknown protocol %v", protocol))
	}
	return getSensorData.(func(string) ([]byte, error))(ip)
}
