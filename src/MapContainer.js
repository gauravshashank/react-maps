import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, DistanceMatrixService, TrafficLayer } from '@react-google-maps/api';

import './MapContainer.css';

const containerStyle = {
    width: '100%',
    height: '800px'
};

const center = {
    lat: -3.745,
    lng: -38.523
};
export default function MapContainer(prop) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyCD3PlfOx9qSOHV4LOxqxZFjBSkEZC7lvE"
    });

    const [map, setMap] = useState(null);
    const [response, setResponse] = useState(null);
    const [travelMode, setTravelMode] = useState('Driving');
    const [origin, setOrigin]= useState('');
    const [destination, setDestination]= useState('');
    const [distance, setDistance] = useState([]);
    const [control, setControl] = useState(true);
    const [directionControl, setDirectionControl] = useState(true);
    const originRef = useRef(null);
    const destinationRef = useRef(null);

    const directionCallback = useCallback(function callback(response) {
        console.log(response)

        if (response !== null) {
            if (response.status === 'OK') {
                setResponse(response);
                setDirectionControl(false);
            } else {
                console.log('response: ', response)
            }
        }
    }, [])

    const checkDriving = ({ target: { checked } }) => {
        checked &&
            setTravelMode('DRIVING')
    }

  const checkBicycling = ({ target: { checked } }) => {
    checked &&
      setTravelMode('BICYCLING');
  }

  const checkTransit = ({ target: { checked } }) => {
    checked &&
      setTravelMode('TRANSIT')
  }

  const checkWalking = ({ target: { checked } }) => {
    checked &&
      setTravelMode('WALKING')
  }

//   const getOrigin = (ref) => {
//     this.origin = ref
//   }

//   getDestination (ref) {
//     this.destination = ref
//   }

  const onClick = () => {

    if (originRef.value !== '' && destinationRef.value !== '') {
      setOrigin(originRef.current.value);
      setDestination(destinationRef.current.value);
    }
  }


    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds();
        map.fitBounds(bounds);
        setMap(map)
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null)
    }, []);

    if (loadError) {
        return (
            <h1>Maps couldn't be loaded right now. Please try again later</h1>
        )
    }

    return (
        <div className="root">

            <div className="container">

                <div className="textDetailsForm">
                    <div className='form-group'>
                        <label htmlFor='ORIGIN'>Origin</label>
                        <br />
                        <input id='ORIGIN' className='form-control' type='text' ref={originRef} />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='DESTINATION'>Destination</label>
                        <br />
                        <input id='DESTINATION' className='form-control' type='text' ref={destinationRef} />
                    </div>
                    <div className='d-flex flex-wrap'>
                        <div className='form-group custom-control custom-radio mr-4'>
                            <input
                                id='DRIVING'
                                className='custom-control-input'
                                name='travelMode'
                                type='radio'
                                checked={travelMode === 'DRIVING'}
                                onChange={checkDriving}
                            />
                            <label className='custom-control-label' htmlFor='DRIVING'>Driving</label>
                        </div>

                        <div className='form-group custom-control custom-radio mr-4'>
                            <input
                                id='BICYCLING'
                                className='custom-control-input'
                                name='travelMode'
                                type='radio'
                                checked={travelMode === 'BICYCLING'}
                                onChange={checkBicycling}
                            />
                            <label className='custom-control-label' htmlFor='BICYCLING'>Bicycling</label>
                        </div>

                        <div className='form-group custom-control custom-radio mr-4'>
                            <input
                                id='TRANSIT'
                                className='custom-control-input'
                                name='travelMode'
                                type='radio'
                                checked={travelMode === 'TRANSIT'}
                                onChange={checkTransit}
                            />
                            <label className='custom-control-label' htmlFor='TRANSIT'>Transit</label>
                        </div>

                        <div className='form-group custom-control custom-radio mr-4'>
                            <input
                                id='WALKING'
                                className='custom-control-input'
                                name='travelMode'
                                type='radio'
                                checked={travelMode === 'WALKING'}
                                onChange={checkWalking}
                            />
                            <label className='custom-control-label' htmlFor='WALKING'>Walking</label>
                        </div>
                    </div>

                    <button className='btn btn-primary' type='button' onClick={onClick}>
                        Build Route
                    </button>
                </div>
                {
                    distance.distance && 
                    distance.duration && 
                        <div className='dashdetails'>
                            Distance: {distance.distance.text} <br />
                            Time Required: {distance.duration.text}
                        </div>
                }
            </div>
            <div className="mapContainer">
                {
                    isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={{
                                lat: -3.745,
                                lng: -38.523
                            }}
                            zoom={7}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                        >
                            <TrafficLayer autoUpdate />

                            {
                                (
                                    destination !== '' &&
                                    origin !== '' &&
                                    directionControl
                                ) && (
                                    <DirectionsService
                                        options={{ 
                                            destination: destination,
                                            origin: origin,
                                            travelMode: travelMode
                                        }}
                                        callback={directionCallback}
                                        onLoad={directionsService => {
                                            console.log('DirectionsService onLoad directionsService: ', directionsService)
                                        }}
                                        onUnmount={directionsService => {
                                            console.log('DirectionsService onUnmount directionsService: ', directionsService)
                                        }}
                                    />
                                )
                            }

                            {
                                response !== null && (
                                    <DirectionsRenderer
                                        options={{
                                            directions: response
                                        }}
                                        onLoad={directionsRenderer => {
                                            console.log('DirectionsRenderer onLoad directionsRenderer: ', directionsRenderer)
                                        }}
                                        onUnmount={directionsRenderer => {
                                            console.log('DirectionsRenderer onUnmount directionsRenderer: ', directionsRenderer)
                                        }}
                                    />
                                )
                            }
                            { control && destination && origin && 
                                <DistanceMatrixService 
                                    options={{
                                        destinations: [destination],
                                        origins: [origin],
                                        travelMode: "DRIVING",
                                    }}
                                    callback={(res) => {
                                        const distance = res.rows[0]?.elements[0];
                                        setDistance(distance);
                                        setControl(false);
                                    }}
                                />
                            }
                        </GoogleMap>
                    ) : <h1>Loading</h1>
                }
            </div>
        </div>
    );

}