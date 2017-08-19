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
	var prevData float64 = 0
	mqqt.Start()
	for {
		go getSensorData(&prevData)
		time.Sleep(20 * time.Second)
	}
}

func getSensorData(prevData *float64) {
	ret, err := sensors.GetSensorData("192.168.1.36", "casa-calida")
	if err != nil {
		fmt.Println(err)
	} else {
		var data map[string]interface{}

		if err := json.Unmarshal(ret, &data); err != nil {
			panic(err)
		}

		curData, ok := data["temperature"].(float64)

		if ok && *prevData != curData {
			fmt.Println(string(ret))
			mqqt.Publish(fmt.Sprintf("{\"state\" : {\"reported\" : {\"temperature\" : %f}}}", curData))
			*prevData = curData
		}
	}
}
