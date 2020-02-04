import React, { useEffect, useState } from 'react'
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location'
import { MaterialIcons } from '@expo/vector-icons'
import axios from '../services/api'

import { connect, disconnect } from '../services/socket'

function Main({ navigation }) {

    const [techs, setTechs] = useState('')
    const [devs, setDevs] = useState([])
    const [currentRegion, setCurrentRegion] = useState(null)

    useEffect(() => {

        async function loadInitialPosition() {
            const { granted } = await requestPermissionsAsync()

            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true
                })
                const { latitude, longitude } = coords
                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04
                })
            }

        }
        loadInitialPosition()
    }, [])

    function setupWenbsocket() {
        connect()
    }

    async function loadDevs() {
        const { latitude, longitude } = currentRegion

        const response = await axios.get('/search', {
            params: {
                latitude,
                longitude,
                techs
            }
        })

        setDevs(response.data.devs)
        setupWenbsocket()
    }

    function handleRegionChanged(region) {
        setCurrentRegion(region)
    }

    if (!currentRegion) {
        return null
    }

    return (
        <>
            <MapView onRegionChangeComplete={handleRegionChanged} initialRegion={currentRegion} style={styles.map}>

                {
                    devs.map(dev => (
                        <Marker
                            key={dev._id}
                            coordinate={{
                                longitude: dev.location.coordinates[0],
                                latitude: dev.location.coordinates[1],
                            }}>
                            <Image style={styles.avatar} source={{ uri: dev.avatar_url }} />
                            <Callout onPress={() => {
                                navigation.navigate('Profile', { github_username: dev.github_username })
                            }} >
                                <View style={styles.callout} >
                                    <Text style={styles.devNome} >{dev.name}</Text>
                                    <Text style={styles.devBio} > {dev.bio} </Text>
                                    <Text style={styles.devTechs} > {dev.techs.join(', ')} </Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))
                }

            </MapView>

            <View style={styles.searchForm} >
                <TextInput
                    value={techs}
                    onChangeText={text => setTechs(text)}
                    style={styles.searchInput}
                    placeholder="Buscar devs por techs..."
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
                    <MaterialIcons name="my-location" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 3,
        borderColor: '#FFF'
    },
    callout: {
        width: 250,
        borderRadius: 10
    },
    devNome: {
        fontWeight: 'bold',
        fontSize: 16
    },
    devBio: {
        color: '#666',
        marginTop: 5
    },
    devTechs: {
        marginTop: 5,
    },
    searchForm: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row'
    },

    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 4
    },

    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8e4dff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15
    }
})

export default Main