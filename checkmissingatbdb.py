import mysql.connector
import os
import csv

# MySQL connection settings
config = {
    "host": "localhost",
    "user": "root",
    "password": "elleDilleR&7@",  # Use your actual password if needed
    "database": "entur_transit_db"
}

# Path to GTFS files
gtfs_path = r"C:\Users\oyvsa\Dropbox\Annet\oyvind\NOROFF\Exam Project\Bussprosjekt\rb_atb_aggregated-gtfs"

try:
    # Connect to MySQL
    connection = mysql.connector.connect(**config)
    cursor = connection.cursor()
    print("Connected to MySQL database")
    
    # Check for trips that might be missing
    trips_file = os.path.join(gtfs_path, "trips.txt")
    if os.path.exists(trips_file):
        print(f"Checking trips data from {trips_file}")
        
        # First get existing trip IDs from the database
        cursor.execute("SELECT trip_id FROM trips")
        existing_trips = set(row[0] for row in cursor.fetchall())
        print(f"Found {len(existing_trips)} existing trips in database")
        
        # Read trips from file and find missing ones
        with open(trips_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            all_trips = set()
            missing_trips = []
            
            for row in reader:
                trip_id = row.get('trip_id', '')
                all_trips.add(trip_id)
                
                # If this trip isn't in the database, we need to insert it
                if trip_id and trip_id not in existing_trips:
                    # Create values tuple for insertion
                    values = (
                        trip_id,
                        row.get('route_id', ''),
                        row.get('service_id', ''),
                        row.get('trip_headsign', None),
                        row.get('trip_short_name', None),
                        int(row.get('direction_id', 0)) if row.get('direction_id') else None,
                        row.get('block_id', None),
                        row.get('shape_id', None),
                        int(row.get('wheelchair_accessible', 0)) if row.get('wheelchair_accessible') else None,
                        int(row.get('bikes_allowed', 0)) if row.get('bikes_allowed') else None
                    )
                    missing_trips.append(values)
            
            print(f"Found {len(all_trips)} trips in file, {len(missing_trips)} are missing from database")
            
            # Insert missing trips in batches
            if missing_trips:
                batch_size = 1000
                for i in range(0, len(missing_trips), batch_size):
                    batch = missing_trips[i:i+batch_size]
                    try:
                        cursor.executemany(
                            """
                            INSERT INTO trips 
                            (trip_id, route_id, service_id, trip_headsign, trip_short_name, 
                             direction_id, block_id, shape_id, wheelchair_accessible, bikes_allowed)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """, 
                            batch
                        )
                        connection.commit()
                        print(f"Inserted {len(batch)} missing trips")
                    except mysql.connector.Error as err:
                        print(f"Error inserting trips batch: {err}")
                        # Try one by one
                        for values in batch:
                            try:
                                cursor.execute(
                                    """
                                    INSERT INTO trips 
                                    (trip_id, route_id, service_id, trip_headsign, trip_short_name, 
                                     direction_id, block_id, shape_id, wheelchair_accessible, bikes_allowed)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                    """, 
                                    values
                                )
                                connection.commit()
                            except mysql.connector.Error as single_err:
                                # The most common issue might be missing service_id or route_id references
                                print(f"Error inserting trip {values[0]}: {single_err}")
    
    # Now check what trip IDs are actually used in stop_times.txt
    stop_times_file = os.path.join(gtfs_path, "stop_times.txt")
    if os.path.exists(stop_times_file):
        print(f"\nChecking stop_times data from {stop_times_file}")
        
        # Get existing trip IDs again (might have added some above)
        cursor.execute("SELECT trip_id FROM trips")
        existing_trips = set(row[0] for row in cursor.fetchall())
        
        # Check the first 1000 records to see which trip IDs are referenced
        with open(stop_times_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            stop_time_trips = set()
            count = 0
            
            for row in reader:
                trip_id = row.get('trip_id', '')
                if trip_id:
                    stop_time_trips.add(trip_id)
                count += 1
                if count >= 1000:
                    break
        
        # Find trip IDs in stop_times that don't exist in trips table
        missing_trip_ids = stop_time_trips - existing_trips
        if missing_trip_ids:
            print(f"Found {len(missing_trip_ids)} trip IDs in stop_times that don't exist in trips table")
            print("First 10 missing trip IDs:", list(missing_trip_ids)[:10])
            print("\nThis suggests a mismatch between your trips and stop_times data.")
        else:
            print("All sampled stop_times trip IDs exist in the trips table.")
    
    # Now try to import stop_times but only for trips that exist
    print("\nImporting stop_times data for existing trips only...")
    stop_times_file = os.path.join(gtfs_path, "stop_times.txt")
    if os.path.exists(stop_times_file):
        # First, check how many stop_times already exist
        cursor.execute("SELECT COUNT(*) FROM stop_times")
        existing_count = cursor.fetchone()[0]
        print(f"Currently have {existing_count} stop_times records")
        
        # Get all existing trip IDs as a set for fast lookups
        cursor.execute("SELECT trip_id FROM trips")
        existing_trips = set(row[0] for row in cursor.fetchall())
        
        # Read and insert stop_times in batches, but only for existing trips
        with open(stop_times_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            batch = []
            total_inserted = 0
            total_skipped = 0
            batch_size = 1000
            
            for row in reader:
                trip_id = row.get('trip_id', '')
                
                # Only process if the trip exists
                if trip_id in existing_trips:
                    values = (
                        trip_id,
                        row.get('arrival_time', ''),
                        row.get('departure_time', ''),
                        row.get('stop_id', ''),
                        int(row.get('stop_sequence', 0)),
                        row.get('stop_headsign', None),
                        int(row.get('pickup_type', 0)) if row.get('pickup_type') else None,
                        int(row.get('drop_off_type', 0)) if row.get('drop_off_type') else None,
                        float(row.get('shape_dist_traveled', 0)) if row.get('shape_dist_traveled') else None,
                        int(row.get('timepoint', 1)) if row.get('timepoint') else None
                    )
                    batch.append(values)
                else:
                    total_skipped += 1
                
                # Insert batch when it reaches the batch size
                if len(batch) >= batch_size:
                    try:
                        cursor.executemany(
                            """
                            INSERT INTO stop_times 
                            (trip_id, arrival_time, departure_time, stop_id, stop_sequence, 
                             stop_headsign, pickup_type, drop_off_type, shape_dist_traveled, timepoint)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """, 
                            batch
                        )
                        connection.commit()
                        total_inserted += len(batch)
                        print(f"Inserted {len(batch)} records. Total: {total_inserted}, Skipped: {total_skipped}")
                        batch = []
                    except mysql.connector.Error as err:
                        print(f"Error inserting batch: {err}")
                        batch = []
            
            # Insert any remaining records
            if batch:
                try:
                    cursor.executemany(
                        """
                        INSERT INTO stop_times 
                        (trip_id, arrival_time, departure_time, stop_id, stop_sequence, 
                         stop_headsign, pickup_type, drop_off_type, shape_dist_traveled, timepoint)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, 
                        batch
                    )
                    connection.commit()
                    total_inserted += len(batch)
                    print(f"Inserted final {len(batch)} records. Total: {total_inserted}, Skipped: {total_skipped}")
                except mysql.connector.Error as err:
                    print(f"Error inserting final batch: {err}")
            
            print(f"Stop times import completed. Total inserted: {total_inserted}, Total skipped: {total_skipped}")
    
    # Check the final result
    cursor.execute("SELECT COUNT(*) FROM stop_times")
    final_count = cursor.fetchone()[0]
    print(f"Final stop_times count: {final_count}")
    
except mysql.connector.Error as err:
    print(f"Database error: {err}")

finally:
    if 'connection' in locals() and connection.is_connected():
        cursor.close()
        connection.close()
        print("MySQL connection closed")