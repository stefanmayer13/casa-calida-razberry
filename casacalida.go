package main

import (
	"fmt"
	"time"
	"encoding/json"
	"os"
	"os/signal"
	"casa-calida.com/casa-calida-razberry/sensors"
	"casa-calida.com/casa-calida-razberry/mqqt"
)

func main() {
	fmt.Println("Starting polling.")

	go pollSensorData()

	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, os.Interrupt, os.Kill)

	<-sigc

	mqqt.Stop()
}

func pollSensorData() {
	ips := [2]string{"192.168.1.36", "192.168.1.38"}
	prevData := [2][2]float64{{0, 0}, {0, 0}}
	mqqt.Start()
	mqqt.Subscribe()
	for {
		go getSensorData(sensors.GetSensor(ips[0], "casa-calida"), &prevData[0])
		go getSensorData(sensors.GetSensor(ips[1], "casa-calida"), &prevData[1])
		time.Sleep(20 * time.Second)
	}
}

func getSensorData(sensor sensors.Sensor, prevData *[2]float64) (error) {
	ret, err := sensor.GetSensorData()
	if err != nil {
		fmt.Println(err)
		return err
	} else {
		var data map[string]interface{}

		if err := json.Unmarshal(ret, &data); err != nil {
			panic(err)
		}

		curData1, ok1 := data["temperature"].(float64)
		curData2, ok2 := data["humidity"].(float64)

		//fmt.Println(fmt.Sprintf("%f != %f", (*prevData)[0], curData1))
		//fmt.Println(fmt.Sprintf("%f != %f", (*prevData)[1], curData2))
		setPrevData := false
		if ok1 && ((*prevData)[0] != curData1 || (*prevData)[1] != curData2) {
			fmt.Println(string(ret))
			if (ok2) {
				if (curData1 <= 100 && curData2 <= 100) {
					mqqt.Publish("casa-calida-indoor-temp-1", fmt.Sprintf("{\"state\" : {\"reported\" : {\"temperature\" : %f, \"humidity\" : %f}}}", curData1, curData2))
					//fmt.Println(fmt.Sprintf("{\"state\" : {\"reported\" : {\"temperature\" : %f, \"humidity\" : %f}}}", curData1, curData2))
					setPrevData = true
				}
			} else {
				mqqt.Publish("casa-calida-outdoor-temp-1", fmt.Sprintf("{\"state\" : {\"reported\" : {\"temperature\" : %f}}}", curData1))
				//fmt.Println(fmt.Sprintf("{\"state\" : {\"reported\" : {\"temperature\" : %f}}}", curData1))
				setPrevData = true
			}
			if (setPrevData) {
				(*prevData)[0] = curData1
				(*prevData)[1] = curData2
			}
		}
		return nil
	}
}
