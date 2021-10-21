import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
    lng: -96.9282,
    lat: 19.5289,
    zoom: 13.57
}

export const MapaPage = () => {

    const { setRef, coords, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox( puntoInicial );
    const { socket } = useContext( SocketContext )

    useEffect(() => {
        
        socket.on('marcadores-activos', ( marcadores ) => {
            for ( const key of Object.keys( marcadores ) ) {
                agregarMarcador(marcadores[key],key);
            }
        });

    }, [ socket, agregarMarcador ]);

    useEffect(() => {
        
        nuevoMarcador$.subscribe( marcador => {
            socket.emit('marcador-nuevo', marcador );
        });

    }, [ nuevoMarcador$, socket ]);

    useEffect(() => {
        
        movimientoMarcador$.subscribe( marcador => {
            socket.emit('marcador-actualizado', marcador );
        });

    }, [ socket, movimientoMarcador$ ]);

    useEffect(() => {
        
        socket.on('marcador-actualizado', ( marcador ) => {
            actualizarPosicion( marcador );
        });

    }, [ socket, actualizarPosicion ]);

    useEffect(() => {
        socket.on('marcador-nuevo', ( marcador ) => {
            agregarMarcador( marcador, marcador.id );
        });
    }, [ socket, agregarMarcador ]);

    return (
        <>
            <div className="info">
                lng: { coords.lng } | lat: { coords.lat } | zoom: { coords.zoom }
            </div>

            <div
                ref={ setRef }
                className="mapContainer"
            />
        </>
    )
}
