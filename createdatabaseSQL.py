import mysql.connector
import os
import csv
from datetime import datetime

def create_tables(cursor):
    """Create all required tables for GTFS data"""
    tables = [
        """
        CREATE TABLE IF NOT EXISTS agency (
          agency_id VARCHAR(100) PRIMARY KEY,
          agency_name VARCHAR(255) NOT NULL,
          agency_url VARCHAR(255) NOT NULL,
          agency_timezone VARCHAR(50) NOT NULL,
          agency_lang VARCHAR(10),
          agency_phone VARCHAR(50)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS stops (
          stop_id VARCHAR(100) PRIMARY KEY,
          stop_code VARCHAR(50),
          stop_name VARCHAR(255) NOT NULL,
          stop_desc VARCHAR(255),
          stop_lat DECIMAL(10,6) NOT NULL,
          stop_lon DECIMAL(10,6) NOT NULL,
          zone_id VARCHAR(50),
          stop_url VARCHAR(255),
          location_type TINYINT,
          parent_station VARCHAR(100),
          wheelchair_boarding TINYINT
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS routes (
          route_id VARCHAR(100) PRIMARY KEY,
          agency_id VARCHAR(100),
          route_short_name VARCHAR(50),
          route_long_name VARCHAR(255),
          route_desc VARCHAR(255),
          route_type INT NOT NULL,
          route_url VARCHAR(255),
          route_color VARCHAR(6),
          route_text_color VARCHAR(6),
          FOREIGN KEY (agency_id) REFERENCES agency(agency_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS calendar (
          service_id VARCHAR(100) PRIMARY KEY,
          monday TINYINT NOT NULL,
          tuesday TINYINT NOT NULL,
          wednesday TINYINT NOT NULL,
          thursday TINYINT NOT NULL,
          friday TINYINT NOT NULL,
          saturday TINYINT NOT NULL,
          sunday TINYINT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS calendar_dates (
          service_id VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          exception_type TINYINT NOT NULL,
          PRIMARY KEY (service_id, date),
          FOREIGN KEY (service_id) REFERENCES calendar(service_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS shapes (
          shape_id VARCHAR(100) NOT NULL,
          shape_pt_lat DECIMAL(10,6) NOT NULL,
          shape_pt_lon DECIMAL(10,6) NOT NULL,
          shape_pt_sequence INT NOT NULL,
          shape_dist_traveled FLOAT,
          PRIMARY KEY (shape_id, shape_pt_sequence)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS trips (
          trip_id VARCHAR(100) PRIMARY KEY,
          route_id VARCHAR(100) NOT NULL,
          service_id VARCHAR(100) NOT NULL,
          trip_headsign VARCHAR(255),
          trip_short_name VARCHAR(100),
          direction_id TINYINT,
          block_id VARCHAR(100),
          shape_id VARCHAR(100),
          wheelchair_accessible TINYINT,
          bikes_allowed TINYINT,
          FOREIGN KEY (route_id) REFERENCES routes(route_id),
          FOREIGN KEY (service_id) REFERENCES calendar(service_id),
          FOREIGN KEY (shape_id) REFERENCES shapes(shape_id) ON DELETE CASCADE ON UPDATE CASCADE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS stop_times (
          trip_id VARCHAR(100) NOT NULL,
          arrival_time VARCHAR(10) NOT NULL,
          departure_time VARCHAR(10) NOT NULL,
          stop_id VARCHAR(100) NOT NULL,
          stop_sequence INT NOT NULL,
          stop_headsign VARCHAR(255),
          pickup_type TINYINT,
          drop_off_type TINYINT,
          shape_dist_traveled FLOAT,
          timepoint TINYINT,
          PRIMARY KEY (trip_id, stop_sequence),
          FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
          FOREIGN KEY (stop_id) REFERENCES stops(stop_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS transfers (
          from_stop_id VARCHAR(100) NOT NULL,
          to_stop_id VARCHAR(100) NOT NULL,
          transfer_type TINYINT NOT NULL,
          min_transfer_time INT,
          PRIMARY KEY (from_stop_id, to_stop_id),
          FOREIGN KEY (from_stop_id) REFERENCES stops(stop_id),
          FOREIGN KEY (to_stop_id) REFERENCES stops(stop_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS feed_info (
          feed_publisher_name VARCHAR(255) NOT NULL,
          feed_publisher_url VARCHAR(255) NOT NULL,
          feed_lang VARCHAR(10) NOT NULL,
          feed_start_date DATE,
          feed_end_date DATE,
          feed_version VARCHAR(50),
          PRIMARY KEY (feed_publisher_name, feed_publisher_url, feed_lang)
        )
        """
    ]
    
    for table in tables:
        try:
            cursor.execute(table)
            print(f"Table created successfully")
        except mysql.connector.Error as err:
            print(f"Error creating table: {err}")

def import_file(cursor, file_path, table_name, columns, date_columns=None):
    """Generic function to import data from a GTFS file to a MySQL table"""
    if not os.path.exists(file_path):
        print(f"Warning: File {file_path} does not exist. Skipping import for {table_name}.")
        return
    
    if date_columns is None:
        date_columns = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            count = 0
            
            for row in reader:
                # Process date columns (format: YYYYMMDD to MySQL DATE)
                for date_col in date_columns:
                    if date_col in row and row[date_col]:
                        try:
                            date_val = row[date_col]
                            formatted_date = f"{date_val[:4]}-{date_val[4:6]}-{date_val[6:8]}"
                            row[date_col] = formatted_date
                        except (ValueError, IndexError):
                            print(f"Warning: Invalid date format in {date_col}: {row.get(date_col, 'None')}")
                            # Set to a default value or None
                            row[date_col] = None
                
                # Prepare values for insertion
                placeholders = ', '.join(['%s'] * len(columns))
                column_names = ', '.join(columns)
                query = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
                
                values = [row.get(col, None) for col in columns]
                
                cursor.execute(query, values)
                count += 1
                
                # Commit every 1000 rows to avoid large transactions
                if count % 1000 == 0:
                    db.commit()
                    print(f"Imported {count} rows into {table_name}")
            
            # Final commit for any remaining rows
            db.commit()
            print(f"Successfully imported {count} rows into {table_name}")
    
    except Exception as e:
        print(f"Error importing data to {table_name}: {e}")

# Main execution
if __name__ == "__main__":
    try:
        # Connect to the database
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="elleDilleR&7@",
            database="entur_transit_db"
        )
        cursor = db.cursor()
        
        # Set path to GTFS directory
        gtfs_path = r"C:\Users\oyvsa\Dropbox\Annet\oyvind\NOROFF\Exam Project\Bussprosjekt\rb_atb_aggregated-gtfs"
        
        # Create all tables
        print("Creating tables...")
        create_tables(cursor)
        
        # Import all files
        print("\nImporting GTFS data...")
        
        # Import agency
        import_file(
            cursor,
            os.path.join(gtfs_path, "agency.txt"),
            "agency",
            ["agency_id", "agency_name", "agency_url", "agency_timezone", "agency_lang", "agency_phone"]
        )
        
        # Import stops (must come before trips and stop_times)
        import_file(
            cursor,
            os.path.join(gtfs_path, "stops.txt"),
            "stops",
            ["stop_id", "stop_code", "stop_name", "stop_desc", "stop_lat", "stop_lon", 
             "zone_id", "stop_url", "location_type", "parent_station", "wheelchair_boarding"]
        )
        
        # Import shapes (must come before trips)
        import_file(
            cursor,
            os.path.join(gtfs_path, "shapes.txt"),
            "shapes",
            ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence", "shape_dist_traveled"]
        )
        
        # Import calendar (must come before trips)
        import_file(
            cursor,
            os.path.join(gtfs_path, "calendar.txt"),
            "calendar",
            ["service_id", "monday", "tuesday", "wednesday", "thursday", 
             "friday", "saturday", "sunday", "start_date", "end_date"],
            ["start_date", "end_date"]
        )
        
        # Import routes (must come before trips)
        import_file(
            cursor,
            os.path.join(gtfs_path, "routes.txt"),
            "routes",
            ["route_id", "agency_id", "route_short_name", "route_long_name", "route_desc", 
             "route_type", "route_url", "route_color", "route_text_color"]
        )
        
        # Import trips (depends on routes, calendar, and shapes)
        import_file(
            cursor,
            os.path.join(gtfs_path, "trips.txt"),
            "trips",
            ["trip_id", "route_id", "service_id", "trip_headsign", "trip_short_name", 
             "direction_id", "block_id", "shape_id", "wheelchair_accessible", "bikes_allowed"]
        )
        
        # Import stop_times (depends on trips and stops)
        import_file(
            cursor,
            os.path.join(gtfs_path, "stop_times.txt"),
            "stop_times",
            ["trip_id", "arrival_time", "departure_time", "stop_id", "stop_sequence", 
             "stop_headsign", "pickup_type", "drop_off_type", "shape_dist_traveled", "timepoint"]
        )
        
        # Import calendar_dates (depends on calendar)
        import_file(
            cursor,
            os.path.join(gtfs_path, "calendar_dates.txt"),
            "calendar_dates",
            ["service_id", "date", "exception_type"],
            ["date"]
        )
        
        # Import transfers (depends on stops)
        import_file(
            cursor,
            os.path.join(gtfs_path, "transfers.txt"),
            "transfers",
            ["from_stop_id", "to_stop_id", "transfer_type", "min_transfer_time"]
        )
        
        # Import feed_info
        import_file(
            cursor,
            os.path.join(gtfs_path, "feed_info.txt"),
            "feed_info",
            ["feed_publisher_name", "feed_publisher_url", "feed_lang", 
             "feed_start_date", "feed_end_date", "feed_version"],
            ["feed_start_date", "feed_end_date"]
        )
        
        print("\nAll GTFS data imported successfully!")
    
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        if 'db' in locals() and db.is_connected():
            cursor.close()
            db.close()
            print("Database connection closed.")