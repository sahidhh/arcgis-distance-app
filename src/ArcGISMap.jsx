import { useRef, useEffect } from "react";
import { loadModules } from "esri-loader";

const ArcGISMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    let view;

    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/geometry/geometryEngine",
        "esri/layers/GraphicsLayer",
      ],
      { css: true }
    )
      .then(([Map, MapView, Graphic, geometryEngine, GraphicsLayer]) => {
        if (!mapRef.current) {
          return;
        }

        const map = new Map({
          basemap: "streets-navigation-vector",
        });

        view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-100.33, 25.69],
          zoom: 3,
        });

        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);

        let points = [];

        view.on("click", (event) => {
          if (points.length < 2) {
            const point = event.mapPoint;
            console.log("Point:", point);

            points.push(point);

            const pointGraphic = new Graphic({
              geometry: point,
              symbol: {
                type: "simple-marker",
                color: "red",
                size: "8px",
              },
            });
            graphicsLayer.add(pointGraphic);

            if (points.length === 2) {
              const path = [
                [points[0].longitude, points[0].latitude],
                [points[1].longitude, points[1].latitude],
              ];
              console.log("Path:", path);

              try {
                const distance = geometryEngine.geodesicLength(
                  {
                    type: "polyline",
                    paths: [path],
                    spatialReference: { wkid: 4326 },
                  },
                  "kilometers"
                );

                console.log("Distance:", distance);
                alert(`Geodesic Distance: ${distance.toFixed(2)} km`);
              } catch (error) {
                console.error("Error calculating geodesic length:", error);
                alert("Failed. Please try again.");
              }
              points = [];
            }
          }
        });
      })
      .catch((err) => {
        console.error("ArcGIS: ", err);
      });

    return () => {
      if (!!view) {
        view.destroy();
        view = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vh",
      }}
      ref={mapRef}
    ></div>
  );
};

export default ArcGISMap;
