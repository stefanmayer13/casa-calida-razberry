package zwave

import (
	"fmt"	
	"net/http"
	"io/ioutil"
	"time"
)

var client  = &http.Client{
  Timeout: time.Second * 10,
}

func GetSensorData(ip string) ([]byte, error) {
	resp, err := client.Get(fmt.Sprintf("http://%v/api/", ip))
	if err != nil {
		//TODO errohandling
		fmt.Println("Errored when sending request to sensor")
        return nil, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		//TODO errohandling
		fmt.Println("Errored when sending request to sensor")
        return nil, err
	}
	return body, nil
}
