import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoianVhbi1nYSIsImEiOiJja3N4bDMwc28wZ216Mm5tc2FpZTNocjF3In0.hcGJX1BZIbbA6RtQ4WUypA';

export const useMapbox = ( puntoInicial ) => {

    // Referencia al div del mapa
    const mapaDiv = useRef();
    const setRef = useCallback( (node) => {
        mapaDiv.current = node;
    }, [])

    // Referencia a los marcadores
    const marcadores = useRef({});

    // Observables de Rxjs
    const movimientoMarcador = useRef( new Subject() );
    const nuevoMarcador = useRef( new Subject() );

    // Mapa y coords
    const mapa = useRef();
    const [ coords, setCoords ] = useState( puntoInicial );

    // Función para crear marcadores
    const agregarMarcador = useCallback( (ev, id) => {
            
            const { lng, lat } = ev.lngLat || ev;

            const marker = new mapboxgl.Marker();
            marker.id = id ?? v4();

            marker
                .setLngLat([ lng, lat ])
                .addTo( mapa.current )
                .setDraggable( true );

            // Asignamos al objeto de marcadores
            marcadores.current[ marker.id ] = marker;

            if ( !id ) {
                nuevoMarcador.current.next({
                    id: marker.id,
                    lng,
                    lat
                });
            }

            // Escuchar movimientos del marcador
            marker.on('drag', ({ target }) => {
                const { id } = target;
                const { lng, lat } = target.getLngLat();
                movimientoMarcador.current.next({ id, lng, lat });
            });

    }, []);

    const actualizarPosicion = useCallback( ({ id, lng, lat }) => {

        marcadores.current[id].setLngLat([ lng, lat ]);

    }, []);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [ puntoInicial.lng, puntoInicial.lat ],
            zoom: puntoInicial.zoom
            });
        mapa.current = map;
    }, [ puntoInicial ]);

    // Cuando se mueve el mapa
    useEffect(() => {
        
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
        });

    }, []);

    // Agregar marcadores cuándo hago click
    useEffect(() => {
        
        mapa?.current.on('click', agregarMarcador );

    }, [ agregarMarcador ]);

    return {
        actualizarPosicion,
        agregarMarcador,
        coords,
        marcadores,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        setRef
    }
}
