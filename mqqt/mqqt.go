package mqqt

import (
	"fmt"
	"github.com/yosssi/gmq/mqtt"
	"github.com/yosssi/gmq/mqtt/client"
)

var cli *client.Client = nil

func Start() {
	cli = client.New(&client.Options{
		ErrorHandler: func(err error) {
			fmt.Println(err)
		},
	})

	// Connect to the MQTT Server.
	err := cli.Connect(&client.ConnectOptions{
		Network:  "tcp",
		Address:  "localhost:1883",
		ClientID: []byte("test-client"),
	})
	if err != nil {
		panic(err)
	}
}

func Publish(thing string, message string) {
	err := cli.Publish(&client.PublishOptions{
		QoS:       mqtt.QoS0,
		TopicName: []byte(fmt.Sprintf("casacalida_to_awsiot/%v/shadow/update", thing)),
		Message:   []byte(message),
	})
	if err != nil {
		panic(err)
	}
}

func Stop() {
	if err := cli.Disconnect(); err != nil {
		panic(err)
	}

	fmt.Println("Stopping mqqt conenction")

	defer cli.Terminate()
}